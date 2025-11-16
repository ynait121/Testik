'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Workflow, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold">Welcome to AI Platform</h1>
        <p className="text-muted-foreground mt-2">
          Create powerful AI applications with advanced agent orchestration
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/projects/new">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <FolderKanban className="w-8 h-8 text-primary mb-2" />
              <CardTitle>New Project</CardTitle>
              <CardDescription>Create a new AI project</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/workflows/new">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <Workflow className="w-8 h-8 text-primary mb-2" />
              <CardTitle>New Workflow</CardTitle>
              <CardDescription>Build an AI workflow</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dari-builder">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <Plus className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Generate App</CardTitle>
              <CardDescription>AI-powered app generation</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/templates">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <Activity className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Templates</CardTitle>
              <CardDescription>Browse ready-to-use templates</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recent AI projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">E-commerce Bot</h3>
                <p className="text-sm text-muted-foreground">Last updated 2 hours ago</p>
              </div>
              <Button variant="outline" size="sm">
                Open
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Data Pipeline</h3>
                <p className="text-sm text-muted-foreground">Last updated 1 day ago</p>
              </div>
              <Button variant="outline" size="sm">
                Open
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Web Scraper</h3>
                <p className="text-sm text-muted-foreground">Last updated 3 days ago</p>
              </div>
              <Button variant="outline" size="sm">
                Open
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
