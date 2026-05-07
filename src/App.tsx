import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import TaskDetail from './components/TaskDetail';
import InboxView from './views/InboxView';
import TodayView from './views/TodayView';
import UpcomingView from './views/UpcomingView';
import FiltersView from './views/FiltersView';
import ReportsView from './views/ReportsView';
import ProjectView from './views/ProjectView';
import AddTaskInline from './components/AddTaskInline';

function MainContent() {
  const { state, dispatch } = useStore();
  const { selectedView, selectedTaskId } = state;

  const showDetail = selectedTaskId && selectedTaskId !== '__new__';
  const showAddModal = selectedTaskId === '__new__';

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />

      {/* Main view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedView === 'inbox' && <InboxView />}
        {selectedView === 'today' && <TodayView />}
        {selectedView === 'upcoming' && <UpcomingView />}
        {selectedView === 'filters' && <FiltersView />}
        {selectedView === 'reports' && <ReportsView />}
        {selectedView === 'project' && <ProjectView />}
      </div>

      {/* Task detail panel */}
      {showDetail && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => dispatch({ type: 'SELECT_TASK', id: null })}
        />
      )}

      {/* Quick add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-24" onClick={() => dispatch({ type: 'SELECT_TASK', id: null })}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ajouter une tâche</h3>
              <AddTaskInline onClose={() => dispatch({ type: 'SELECT_TASK', id: null })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
