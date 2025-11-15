'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderKanban, Search, MoreVertical, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Bot',
    type: 'bot',
    description: 'AI-powered e-commerce assistant',
    status: 'active',
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Data Pipeline',
    type: 'workflow',
    description: 'Automated data processing workflow',
    status: 'active',
    updatedAt: '1 day ago',
  },
  {
    id: '3',
    name: 'Web Scraper',
    type: 'automation',
    description: 'Intelligent web scraping tool',
    status: 'active',
    updatedAt: '3 days ago',
  },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState('');

  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI projects and workflows
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FolderKanban className="w-8 h-8 text-primary" />
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                    {project.type}
                  </span>
                  <span className="text-muted-foreground">{project.updatedAt}</span>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Try a different search term' : 'Create your first project to get started'}
            </p>
            {!search && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
