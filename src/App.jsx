import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import GameHub from '@/pages/GameHub';
import Home from '@/pages/Home';
import FreePlay from '@/pages/FreePlay';
import SongMode from '@/pages/SongMode';
import ColoringGame from '@/pages/ColoringGame';
import PuzzleGame from '@/pages/PuzzleGame';
import SpotItGame from '@/pages/SpotItGame';
import MarbleGame from '@/pages/MarbleGame';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<GameHub />} />
      <Route path="/piano" element={<Home />} />
      <Route path="/free-play" element={<FreePlay />} />
      <Route path="/song-mode" element={<SongMode />} />
      <Route path="/coloring" element={<ColoringGame />} />
      <Route path="/puzzle" element={<PuzzleGame />} />
      <Route path="/spotit" element={<SpotItGame />} />
      <Route path="/marble" element={<MarbleGame />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App