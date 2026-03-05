import ChatBot from './components/chatbotFull'

function App() {

  return (
    <div>
      <ChatBot 
        webhookUrl={import.meta.env.VITE_KARSADA_WEBHOOK_URL} 
        chatBotName="PrimaCare" 
      />
    </div>
  )
}

export default App
