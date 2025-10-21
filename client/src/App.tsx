import { Toaster } from "./assets/shadcn-ui/components/ui/sonner";
import Layout from "./core/Layout";
import ThemeDebug from "./components/ThemeDebug";

const App = () => {
  return <>
    <Layout />
    {/* <ThemeDebug /> */}
    <Toaster position="top-right" richColors duration={3000} closeButton/>
  </>;
};

export default App;


