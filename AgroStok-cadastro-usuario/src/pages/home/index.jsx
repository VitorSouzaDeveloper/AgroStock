import './style.css'
import api from '../../services/api.js'
import { useEffect, useState, useRef } from 'react';

function Home() {
  const [users, setUsers] = useState([]);

  const inputname = useRef();
  const inputIdade = useRef();
  const inputEmail = useRef();
  const inputSenha = useRef();

  async function getUsers() {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('There was an error!', error);
    }
  } 

  useEffect(() => {
    getUsers();
  }, []);
  async function createUsers() {
    await api.post('/users', {
      name: inputname.current.value,
      idade: inputIdade.current.value,
      email: inputEmail.current.value,
      senha: inputSenha.current.value
    })
    getUsers();
  }

  //  async function deleteUsers(id) {
  //   try {
  //     await api.delete(`/users/${id}`);
  //     getUsers();
  //   } catch (error) {
  //     console.error('There was an error!', error);
  //   }
  // } 

  return (
   
    <div className='container'> 
      <form>
        <h1>Cadastro de Usuários</h1>
        {/* CORRIGIDO AQUI 👇 */}
        <input name='name' type='text' placeholder='name' required ref={inputname} />
        <input name='idade' type='number' placeholder='Idade' required ref={inputIdade} />
        <input name='email' type='email' placeholder='E-mail' required ref={inputEmail} />
        <input name='senha' type='password' placeholder='Senha' required ref={inputSenha} />
        <button type='button' onClick={createUsers}>Cadastrar</button>
        {/* CORRIGIDO AQUI 👇 */}
        <div className='footer'>
          <p>Já possui uma conta? 
            <a href='#'> Login</a>
          </p>
        </div>
      </form>
    </div>
)
}

export default Home
  