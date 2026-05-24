import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router";

import { ToastProvider } from "./components/Toast";
import Layout from "./components/Layout";
import EditPostPage from "./pages/EditPostPage";
import MyBlogPage from "./pages/MyBlogPage";
import ReadPostPage from "./pages/ReadPostPage";
import SavedPostsPage from "./pages/SavedPostsPage";
import SettingsPage from "./pages/SettingsPage";

import "./styles/primitive.css";
import "./styles/semantic.css";
import "./styles/global.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/saved" replace />,
      },
      {
        path: "saved",
        element: <SavedPostsPage />,
      },
      {
        path: "my-blog",
        element: <MyBlogPage />,
      },
      {
        path: "post/:id/edit",
        element: <EditPostPage />,
      },
      {
        path: "post/:id",
        element: <ReadPostPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);
