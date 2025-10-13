import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Logo from '../../components/Logo'; // 1. Importe o novo componente Logo
import './style.css';

function Home() {
    const navigate = useNavigate();

    const inputName = useRef();
    const inputIdade = useRef();
    const inputEmail = useRef();
    const inputSenha = useRef();

    async function createUsers() {
        try {
            const name = inputName.current.value;
            const email = inputEmail.current.value;
            const senha = inputSenha.current.value;
            const idade = inputIdade.current.value;

            if (!name || !email || !senha) {
                alert("Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Senha).");
                return;
            }

            await api.post('/users', { name, idade, email, senha });
            alert("Usuário cadastrado com sucesso! Redirecionando para o login...");
            navigate('/');

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao cadastrar usuário. Tente novamente.';
            alert(errorMessage);
        }
    }

    return (
        <div className='container'>
            {/* 2. Adicione o componente Logo aqui */}
            <Logo />
            
            <form>
                {/* 3. Mude o título para h2 */}
                <h2>Crie sua conta</h2>
                <input name='name' type='text' placeholder='Nome' required ref={inputName} />
                <input name='idade' type='text' placeholder='Idade' ref={inputIdade} />
                <input name='email' type='email' placeholder='E-mail' required ref={inputEmail} />
                <input name='senha' type='password' placeholder='Senha' required ref={inputSenha} />
                <button type='button' onClick={createUsers}>Cadastrar</button>
                <div className='footer'>
                    <p>Já possui uma conta?
                        <Link to="/"> Login</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Home;