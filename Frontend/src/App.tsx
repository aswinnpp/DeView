import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "@/context/store";
import Router from "@/app/Router";

const App = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>

                <Router />

            </BrowserRouter>
        </Provider>
    );
};

export default App;
