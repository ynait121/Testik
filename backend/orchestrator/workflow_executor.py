"""
Workflow Executor
Выполнение сложных workflow с графами агентов
"""

from typing import Dict, Any, List, Optional
import asyncio
from loguru import logger
import networkx as nx
from datetime import datetime


class WorkflowExecutor:
    """
    Исполнитель workflow

    Поддерживает:
    - Последовательное выполнение
    - Параллельное выполнение
    - Условные переходы
    - Циклы
    - Обработку ошибок
    """

    def __init__(self, orchestrator):
        self.orchestrator = orchestrator
        self.context = {}

    async def execute(
        self,
        workflow_definition: Dict[str, Any],
        input_data: Dict[str, Any],
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Выполнение workflow

        Workflow definition structure:
        {
            "nodes": [
                {
                    "id": "node1",
                    "type": "agent",  # agent, condition, loop, group
                    "agent_type": "code_generator",
                    "config": {}
                }
            ],
            "edges": [
                {
                    "source": "node1",
                    "target": "node2",
                    "condition": "optional condition"
                }
            ],
            "variables": {}
        }
        """
        logger.info(f"Executing workflow with {len(workflow_definition.get('nodes', []))} nodes")

        # Initialize context
        self.context = {
            **workflow_definition.get("variables", {}),
            **input_data,
            "_execution_id": f"exec_{datetime.utcnow().timestamp()}",
            "_user_id": user_id,
        }

        # Build execution graph
        graph = self._build_graph(workflow_definition)

        # Find start nodes (nodes with no incoming edges)
        start_nodes = [
            node for node in graph.nodes()
            if graph.in_degree(node) == 0
        ]

        if not start_nodes:
            raise ValueError("Workflow has no start nodes")

        # Execute workflow
        results = await self._execute_graph(graph, start_nodes)

        return {
            "status": "completed",
            "results": results,
            "context": self.context,
        }

    def _build_graph(self, workflow_definition: Dict[str, Any]) -> nx.DiGraph:
        """Построение графа выполнения"""
        graph = nx.DiGraph()

        # Add nodes
        for node in workflow_definition.get("nodes", []):
            graph.add_node(node["id"], **node)

        # Add edges
        for edge in workflow_definition.get("edges", []):
            graph.add_edge(
                edge["source"],
                edge["target"],
                condition=edge.get("condition"),
            )

        return graph

    async def _execute_graph(
        self,
        graph: nx.DiGraph,
        start_nodes: List[str],
    ) -> Dict[str, Any]:
        """Выполнение графа"""
        results = {}
        executed = set()
        to_execute = set(start_nodes)

        while to_execute:
            # Find nodes ready to execute (all dependencies satisfied)
            ready = [
                node for node in to_execute
                if all(pred in executed for pred in graph.predecessors(node))
            ]

            if not ready:
                logger.warning("Workflow has cycles or unresolved dependencies")
                break

            # Group nodes that can run in parallel
            parallel_nodes = []
            for node_id in ready:
                node_data = graph.nodes[node_id]
                if node_data.get("parallel", False):
                    parallel_nodes.append(node_id)

            # Execute parallel nodes
            if parallel_nodes:
                tasks = [
                    self._execute_node(graph, node_id)
                    for node_id in parallel_nodes
                ]
                node_results = await asyncio.gather(*tasks, return_exceptions=True)

                for node_id, result in zip(parallel_nodes, node_results):
                    if isinstance(result, Exception):
                        logger.error(f"Node {node_id} failed: {result}")
                        results[node_id] = {"status": "failed", "error": str(result)}
                    else:
                        results[node_id] = result

                    executed.add(node_id)
                    to_execute.remove(node_id)

                    # Add next nodes
                    for successor in graph.successors(node_id):
                        edge_data = graph.edges[node_id, successor]
                        if self._evaluate_condition(edge_data.get("condition"), results[node_id]):
                            to_execute.add(successor)

            # Execute sequential nodes
            else:
                node_id = ready[0]
                result = await self._execute_node(graph, node_id)
                results[node_id] = result
                executed.add(node_id)
                to_execute.remove(node_id)

                # Add next nodes
                for successor in graph.successors(node_id):
                    edge_data = graph.edges[node_id, successor]
                    if self._evaluate_condition(edge_data.get("condition"), result):
                        to_execute.add(successor)

        return results

    async def _execute_node(self, graph: nx.DiGraph, node_id: str) -> Dict[str, Any]:
        """Выполнение одного узла"""
        node_data = graph.nodes[node_id]
        node_type = node_data.get("type")

        logger.info(f"Executing node {node_id} (type: {node_type})")

        if node_type == "agent":
            return await self._execute_agent_node(node_data)
        elif node_type == "condition":
            return await self._execute_condition_node(node_data)
        elif node_type == "loop":
            return await self._execute_loop_node(node_data, graph)
        elif node_type == "group":
            return await self._execute_group_node(node_data)
        else:
            raise ValueError(f"Unknown node type: {node_type}")

    async def _execute_agent_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """Выполнение узла-агента"""
        agent_type = node_data.get("agent_type")
        config = node_data.get("config", {})

        # Resolve variables in config
        resolved_config = self._resolve_variables(config)

        # Execute agent
        result = await self.orchestrator.execute_agent(
            agent_type=agent_type,
            input_data=resolved_config,
            context=self.context,
            user_id=self.context.get("_user_id"),
        )

        # Update context with output
        output_var = node_data.get("output_variable")
        if output_var:
            self.context[output_var] = result

        return result

    async def _execute_condition_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """Выполнение условного узла"""
        condition = node_data.get("condition")
        result = self._evaluate_expression(condition)

        return {"condition_result": result}

    async def _execute_loop_node(
        self,
        node_data: Dict[str, Any],
        graph: nx.DiGraph,
    ) -> Dict[str, Any]:
        """Выполнение узла-цикла"""
        loop_type = node_data.get("loop_type", "for")  # for, while
        iterations = []

        if loop_type == "for":
            items = self._resolve_variables(node_data.get("items", []))
            item_var = node_data.get("item_variable", "item")

            for item in items:
                # Set loop variable
                old_value = self.context.get(item_var)
                self.context[item_var] = item

                # Execute loop body
                # (This is simplified - in reality, we'd execute a subgraph)
                iteration_result = {"item": item}
                iterations.append(iteration_result)

                # Restore old value
                if old_value is not None:
                    self.context[item_var] = old_value

        return {"iterations": iterations}

    async def _execute_group_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """Выполнение группы агентов"""
        agents = node_data.get("agents", [])
        mode = node_data.get("mode", "parallel")  # parallel, sequential

        if mode == "parallel":
            tasks = [
                self.orchestrator.execute_agent(
                    agent_type=agent["type"],
                    input_data=self._resolve_variables(agent.get("config", {})),
                    context=self.context,
                )
                for agent in agents
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        else:  # sequential
            results = []
            for agent in agents:
                result = await self.orchestrator.execute_agent(
                    agent_type=agent["type"],
                    input_data=self._resolve_variables(agent.get("config", {})),
                    context=self.context,
                )
                results.append(result)

        return {"group_results": results}

    def _evaluate_condition(
        self,
        condition: Optional[str],
        node_result: Dict[str, Any],
    ) -> bool:
        """Оценка условия перехода"""
        if not condition:
            return True

        try:
            # Simple condition evaluation
            # In production, use a safer expression evaluator
            context = {**self.context, "result": node_result}
            return eval(condition, {"__builtins__": {}}, context)
        except Exception as e:
            logger.error(f"Failed to evaluate condition: {e}")
            return False

    def _evaluate_expression(self, expression: str) -> Any:
        """Оценка выражения"""
        try:
            return eval(expression, {"__builtins__": {}}, self.context)
        except Exception as e:
            logger.error(f"Failed to evaluate expression: {e}")
            return None

    def _resolve_variables(self, data: Any) -> Any:
        """Разрешение переменных в данных"""
        if isinstance(data, str):
            # Replace ${variable} with value from context
            if data.startswith("${") and data.endswith("}"):
                var_name = data[2:-1]
                return self.context.get(var_name, data)
            return data

        elif isinstance(data, dict):
            return {k: self._resolve_variables(v) for k, v in data.items()}

        elif isinstance(data, list):
            return [self._resolve_variables(item) for item in data]

        else:
            return data
