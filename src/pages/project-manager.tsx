import { ProjectManager } from '@/components/projects/project-manager'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function ProjectManagerPage() {
  return (
    <DashboardLayout>
      <div className="h-full w-full flex flex-col">
        <ProjectManager 
          projectId="workspace-projects"
          projectName="Gerenciador de Projetos"
          onBack={() => window.history.back()}
        />
      </div>
    </DashboardLayout>
  )
}
