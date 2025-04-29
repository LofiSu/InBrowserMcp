import { ChatProvider } from "./context/ChatContext";
import { SettingsProvider } from "./context/SettingsContext";
import ChatContainer from "./components/ChatContainer";
import "./styles/global.scss";

function App() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <ChatContainer />
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;
