import './App.css'
import { Signin } from './components/Signin'
import { Signup } from './components/Signup'

function App() {

  return (
    <div className='flex flex-col w-screen h-screen justify-center items-center'>
      {<Signup/> ? <Signin/> : <Signup/>}
    </div>
  )
}

export default App
