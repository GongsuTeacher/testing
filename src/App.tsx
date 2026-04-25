import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { UserData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, BookOpen, Brain, Pencil, LogIn, LogOut, Home, User as UserIcon } from 'lucide-react';
import { cn } from './lib/utils';

// Views
import Dashboard from './components/Dashboard';
import LearningView from './components/LearningView';
import QuizView from './components/QuizView';
import ReviewView from './components/ReviewView';
import CompositionView from './components/CompositionView';
import WordbookView from './components/WordbookView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create user data
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const initialData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            points: 0,
            stars: 0,
            lastLearnedDay: 0,
            wrongWords: [],
            dailyProgress: {},
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
        }

        // Real-time listener for updates (points, stars)
        const unsubData = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
        });
        return () => unsubData();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-bounce">
          <BookOpen className="w-12 h-12 text-sky-500" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-sky-50 font-sans text-slate-900 pb-20 md:pb-0">
        {user ? (
          <>
            <Navbar userData={userData} />
            <main className="max-w-4xl mx-auto p-4 pt-20">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard userData={userData} />} />
                  <Route path="/learn/:day" element={<LearningView user={user} userData={userData} />} />
                  <Route path="/quiz/:day" element={<QuizView user={user} userData={userData} />} />
                  <Route path="/review" element={<ReviewView user={user} userData={userData} />} />
                  <Route path="/composition" element={<CompositionView user={user} userData={userData} />} />
                  <Route path="/wordbook" element={<WordbookView user={user} userData={userData} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </main>
            <MobileNav />
          </>
        ) : (
          <LoginView />
        )}
      </div>
    </Router>
  );
}

function Navbar({ userData }: { userData: UserData | null }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-8 h-16 flex items-center justify-between shadow-sm">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-indigo-100">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">초등 필수 영단어 마스터</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Grade 4-6 Curriculum</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Points & Stars */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cumulative Points</span>
            <span className="text-xl font-black text-indigo-600 leading-none">{userData?.points || 0} pts</span>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-5 h-5", 
                  i < (userData?.stars || 0) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"
                )} 
              />
            ))}
          </div>
        </div>

        <button 
          onClick={() => auth.signOut()}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="로그아웃"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

function MobileNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around h-20 z-50 md:hidden">
      <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 p-2 text-indigo-600">
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Dash</span>
      </button>
      <button onClick={() => navigate('/review')} className="flex flex-col items-center gap-1 p-2 text-slate-400">
        <Brain className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Review</span>
      </button>
      <button onClick={() => navigate('/composition')} className="flex flex-col items-center gap-1 p-2 text-slate-400">
        <Pencil className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Write</span>
      </button>
      <button onClick={() => navigate('/wordbook')} className="flex flex-col items-center gap-1 p-2 text-slate-400">
        <UserIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Words</span>
      </button>
    </nav>
  );
}

function LoginView() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-400 via-sky-300 to-indigo-400">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <div className="bg-sky-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">영단어 마스터</h1>
        <p className="text-slate-500 mb-8 font-medium">초등 4-6학년 필수 영단어를<br/>즐겁게 공부해봐요!</p>
        
        <button
          onClick={() => {
            setLoading(true);
            signInWithGoogle().finally(() => setLoading(false));
          }}
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <LogIn className="w-5 h-5" />
          {loading ? '로그인 중...' : '구글 계정으로 시작하기'}
        </button>

        <p className="mt-8 text-xs text-slate-400">
          계속 진행함으로써 서비스 이용약관 및<br/>개인정보 처리방침에 동의하게 됩니다.
        </p>
      </motion.div>
    </div>
  );
}
