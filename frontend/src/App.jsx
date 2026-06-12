import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api, { setAuthToken } from "./api/api";

import Spinner from "./components/Spinner";
import LoginScreen from "./components/LoginScreen";
import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import Message from "./components/Message";
import ThinkingIndicator from "./components/ThinkingIndicator";
import ChatInput from "./components/ChatInput";
import CompareBar from "./components/CompareBar";
import CompareModal from "./components/CompareModal";
import { carKey } from "./utils/carHelpers";

export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  // ── Compare feature state ──────────────────────────────────
  const [selectedCars, setSelectedCars] = useState([]); // max 2
  const [showCompare, setShowCompare] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Once authenticated, set token + load session
  useEffect(() => {
    if (!isAuthenticated) return;

    const init = async () => {
      setSessionLoading(true);
      try {
        const token = await getAccessTokenSilently();
        setAuthToken(token);

        const { data } = await api.get("/session");
        if (data.messages && data.messages.length > 0) {
          const uiMessages = data.messages.map((m) =>
            m.role === "user"
              ? { role: "user", content: m.content }
              : { role: "assistant", recommendation: m.content, cars: m.cars || [] }
          );
          setMessages(uiMessages);
          setStarted(true);
        }
      } catch (err) {
        // No session yet or network error — start fresh silently
        console.error("Session load error:", err);
      } finally {
        setSessionLoading(false);
      }
    };

    init();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Auth0 SDK still initializing
  if (isLoading) return <Spinner />;

  // Not logged in — show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => loginWithRedirect()} />;
  }

  // Loading saved session
  if (sessionLoading) return <Spinner />;

  const send = async (query) => {
    const q = (query || input).trim();
    if (!q || loading) return;

    try {
      const token = await getAccessTokenSilently();
      setAuthToken(token);
    } catch (err) {
      console.error("Token refresh failed:", err);
    }

    setStarted(true);
    setInput("");

    const updatedMessages = [...messages, { role: "user", content: q }];
    setMessages(updatedMessages);
    setLoading(true);

    // Build history in the format backend expects — exclude the message we just added
    const history = messages.map((m) => ({
      role: m.role,
      content: m.role === "assistant" ? m.recommendation : m.content,
    }));

    try {
      const { data } = await api.post("/chat", { query: q, history });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", recommendation: data.recommendation, cars: data.cars },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", recommendation: "Could not connect to server. Please try again.", cars: [] },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = async () => {
    try {
      await api.delete("/session");
    } catch (err) {
      console.error("Clear session error:", err);
    }
    setMessages([]);
    setStarted(false);
    setInput("");
    setSelectedCars([]);
    setShowCompare(false);
  };

  // ── Compare handlers ──────────────────────────────────────
  const toggleCompare = (car) => {
    setSelectedCars((prev) => {
      const exists = prev.some((c) => carKey(c) === carKey(car));
      if (exists) return prev.filter((c) => carKey(c) !== carKey(car));
      if (prev.length >= 2) return prev; // already 2 selected
      return [...prev, car];
    });
  };

  const removeFromCompare = (car) => {
    setSelectedCars((prev) => prev.filter((c) => carKey(c) !== carKey(car)));
  };

  const clearCompare = () => setSelectedCars([]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Header
        started={started}
        onReset={reset}
        user={user}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!started && <EmptyState onSuggestionClick={send} />}

        {started && (
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {messages.map((msg, i) => (
              <Message
                key={i}
                msg={msg}
                selectedCars={selectedCars}
                onToggleCompare={toggleCompare}
              />
            ))}

            {loading && <ThinkingIndicator />}

            <div ref={bottomRef} />
          </div>
        )}

        <CompareBar
          selectedCars={selectedCars}
          onRemove={removeFromCompare}
          onClear={clearCompare}
          onOpenCompare={() => setShowCompare(true)}
        />

        <ChatInput
          inputRef={inputRef}
          value={input}
          onChange={setInput}
          onSend={send}
          loading={loading}
        />
      </main>

      {showCompare && selectedCars.length === 2 && (
        <CompareModal
          cars={selectedCars}
          onClose={() => setShowCompare(false)}
          onRemove={(car) => {
            removeFromCompare(car);
            setShowCompare(false);
          }}
        />
      )}
    </div>
  );
}
