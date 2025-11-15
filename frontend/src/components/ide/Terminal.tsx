'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onCommand?: (command: string) => void;
}

export function Terminal({ onCommand }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const currentLineRef = useRef<string>('');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: 'rgba(255, 255, 255, 0.3)',
      },
      rows: 30,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('Welcome to AI Platform Terminal');
    term.writeln('Type commands and press Enter');
    term.writeln('');
    term.write('$ ');

    // Handle input
    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle Enter
      if (code === 13) {
        term.writeln('');

        const command = currentLineRef.current.trim();
        if (command) {
          // Execute command
          executeCommand(term, command);

          if (onCommand) {
            onCommand(command);
          }
        }

        currentLineRef.current = '';
        term.write('$ ');
      }
      // Handle Backspace
      else if (code === 127) {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Handle Ctrl+C
      else if (code === 3) {
        term.writeln('^C');
        currentLineRef.current = '';
        term.write('$ ');
      }
      // Handle regular characters
      else {
        currentLineRef.current += data;
        term.write(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const executeCommand = (term: XTerm, command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case 'help':
        term.writeln('Available commands:');
        term.writeln('  help      - Show this help');
        term.writeln('  clear     - Clear terminal');
        term.writeln('  echo      - Echo text');
        term.writeln('  date      - Show current date');
        term.writeln('  ls        - List files (mock)');
        break;

      case 'clear':
        term.clear();
        break;

      case 'echo':
        term.writeln(parts.slice(1).join(' '));
        break;

      case 'date':
        term.writeln(new Date().toString());
        break;

      case 'ls':
        term.writeln('src/');
        term.writeln('components/');
        term.writeln('package.json');
        term.writeln('README.md');
        break;

      default:
        if (command) {
          term.writeln(`Command not found: ${cmd}`);
          term.writeln('Type "help" for available commands');
        }
    }
  };

  return <div ref={terminalRef} className="h-full w-full bg-[#1e1e1e] p-2" />;
}
