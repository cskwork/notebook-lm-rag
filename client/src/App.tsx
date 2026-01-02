// NotebookLM Research Assistant - 메인 앱 컴포넌트
import { Header, Sidebar, ChatArea, MessageInput, ToastContainer } from './components';
import { useResearchSession } from './hooks';

function App() {
  const {
    notebooks,
    selectedNotebook,
    session,
    isLoadingNotebooks,
    isCreatingSession,
    isSendingMessage,
    isGeneratingDoc,
    toasts,
    selectNotebook,
    createSession,
    sendMessage,
    generateDocument,
    downloadDocument,
    dismissToast,
  } = useResearchSession();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header session={session} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          session={session}
          isLoadingNotebooks={isLoadingNotebooks}
          isCreatingSession={isCreatingSession}
          isGeneratingDoc={isGeneratingDoc}
          onSelectNotebook={selectNotebook}
          onCreateSession={createSession}
          onGenerateDoc={generateDocument}
          onDownloadDoc={downloadDocument}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatArea
            messages={session?.messages ?? []}
            isLoading={isSendingMessage}
            hasSession={!!session}
          />

          {session && (
            <MessageInput
              onSend={sendMessage}
              disabled={isSendingMessage}
              placeholder="Ask a question about your notebook..."
            />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App
