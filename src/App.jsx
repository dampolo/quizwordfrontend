import { Routes, Route } from "react-router-dom";
import LoginQuiz from "./quiz/auth/login-quiz";
import CreateAccount from "./quiz/auth/create-account";
import ForgotPassword from "./quiz/auth/forgot-password";
import PublicLayout from "./layouts/PublicLayout";
import Website from "./website/website";
import Login from "./quiz/auth/login-quiz";
import Dashboard from "./quiz/my-quiz/dashboard";
import MyQuiz from "./layouts/MyQuiz";
import AllWords from "./quiz/my-quiz/all-words";
import ProtectedRoute from "./context/ProtectedRoute";
import { VocabularyProvider } from "./context/VocabularyContext";
import { QuizProvider } from "./context/QuizContext";
import { DialogProvider } from "./context/DialogContext/DialogContext";
import { Outlet } from "react-router-dom";
import EditWord from "./quiz/my-quiz/edit-word";
import AddNewWord from "./quiz/my-quiz/add-new-word";
import VocabularyCategories from "./quiz/my-quiz/all-categories";
import AddNewCategory from "./quiz/my-quiz/add-new-category";
import EditCategory from "./quiz/my-quiz/edit-category";
import AllQuizWords from "./quiz/my-quiz/quizzes/AllQuizWords/all-quiz-words";
import { ToastContainer } from "react-toastify";
import Profile from "./quiz/my-quiz/Profile/profile";
import EditProfile from "./quiz/my-quiz/Profile/EditProfile/edit-profile";
import Confirmation from "./components/Confirmation/confirmation";
import ChooseLanguages from "./components/ChooseLanguage/ChooseLanguage";
import AddNewQuiz from "./quiz/my-quiz/quizzes/AddNewQuiz/add-new-quiz";
import AllQuizzes from "./quiz/my-quiz/quizzes/AllQuizzes/all-quizzes";
import PlayQuiz from "./quiz/my-quiz/quizzes/PlayQuiz/play-quiz";
import QuizResults from "./quiz/my-quiz/quizzes/QuizResults/quiz-results";
import LearnQuiz from "./quiz/my-quiz/quizzes/LearnQuiz/learn-quiz";
import Imprint from "./components/imprint";
import PrivacyPolicy from "./components/privacy-policy";
import Price from "./website/price";
import HelpDesk from "./website/help-desk";
import EditLanguages from "./components/ChooseLanguage/EditLanguages";
import ResetPassword from "./quiz/auth/reset-password";
import Settings from "./quiz/my-quiz/Settings/settings";

function App() {
  return (
    // Auth
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Website />} />
          <Route path="/login" element={<Login />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/price" element={<Price />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/help-desk" element={<HelpDesk />} />
          <Route path="/login-quiz" element={<LoginQuiz />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/verify-email/:uidb64/:token" element={<Confirmation />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
            <Route
              element={
                <VocabularyProvider>
                  <QuizProvider>
                    <DialogProvider>
                      <Outlet />
                    </DialogProvider>
                  </QuizProvider>
                </VocabularyProvider>
              }
            >
                {/* Mmy Quiz */}
                <Route path="/my-quiz" element={<MyQuiz />}>
                {/* Profile */}
                <Route path="profile" element={<Profile />} />
                <Route path="edit-profile" element={<EditProfile />} />
                {/* Vocabulary */}
                <Route path="all-words" element={<AllWords />} />
                <Route path=":id/edit-word" element={<EditWord />} />
                <Route path="add-new-word" element={<AddNewWord />} />
                <Route
                  path="vocabulary-categories"
                  element={<VocabularyCategories />}
                />
                <Route path="add-new-category" element={<AddNewCategory />} />
                <Route path=":id/edit-category" element={<EditCategory />} />
                {/* Quizzes */}
                <Route path="all-quizzes" element={<AllQuizzes />} />
                <Route path="add-new-quiz" element={<AddNewQuiz />} />
                <Route path=":id/all-quiz-words" element={<AllQuizWords />} />
                <Route path=":id/play-quiz" element={<PlayQuiz />} />
                <Route path=":id/learn-quiz" element={<LearnQuiz />} />
                <Route path=":id/quiz-results" element={<QuizResults />} />
                <Route path="choose-languages" element={<ChooseLanguages />} />
                <Route path="edit-languages" element={<EditLanguages />} />
                <Route path="settings" element={<Settings />} />


            </Route>
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
