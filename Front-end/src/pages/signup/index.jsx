import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Logo from '../../components/Logo/index.jsx'; 
import './style.css';

function Signup() {
    const navigate = useNavigate();

    const inputName = useRef();
    const inputIdade = useRef();
    const inputEmail = useRef();
    const inputSenha = useRef();
    const inputConfirmarSenha = useRef();

    const [isLoading, setIsLoading] = useState(false);

    // ACRESCIMO: Estados para controlar a visibilidade de cada senha
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    async function createUsers() {
        try {
            setIsLoading(true);
            const name = inputName.current.value;
            const email = inputEmail.current.value;
            const senha = inputSenha.current.value;
            const confirmarSenha = inputConfirmarSenha.current.value;
            const idade = inputIdade.current.value;

            if (!name || !email || !senha || !confirmarSenha) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                setIsLoading(false);
                return;
            }

            if (senha !== confirmarSenha) {
                alert("As senhas não coincidem!");
                setIsLoading(false);
                return;
            }

            await api.post('/users', { name, idade, email, senha });
            alert("Usuário cadastrado com sucesso! Redirecionando para o login...");
            navigate('/');

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao cadastrar usuário. Tente novamente.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    // ACRESCIMO: Componente SVG do Ícone do Olho (para código limpo)
    const EyeIcon = ({ show }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
            {show ? (
                // Ícone Olho Aberto
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            ) : (
                // Ícone Olho Fechado (com risco)
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
            )}
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    return (
        <div className='container'>
            <Logo />
            
            <form>
                <h2>Crie sua conta</h2>
                <input name='name' type='text' placeholder='Nome' required ref={inputName} />
                <input name='idade' type='text' placeholder='Idade' ref={inputIdade} />
                <input name='email' type='email' placeholder='E-mail' required ref={inputEmail} />
                
                {/* ACRESCIMO: Container relativo para o olho se posicionar */}
                <div className="password-container">
                    {/* O type agora é dinâmico: 'text' ou 'password' */}
                    <input name='senha' type={showSenha ? 'text' : 'password'} placeholder='Senha' required ref={inputSenha} />
                    {/* Botão invisível com o ícone */}
                    <button type="button" className="toggle-password" onClick={() => setShowSenha(!showSenha)}>
                        <EyeIcon show={showSenha} />
                    </button>
                </div>
                
                {/* ACRESCIMO: Repetir a mesma lógica para a confirmação */}
                <div className="password-container">
                    <input name='confirmarSenha' type={showConfirmarSenha ? 'text' : 'password'} placeholder='Confirmar Senha' required ref={inputConfirmarSenha} />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}>
                        <EyeIcon show={showConfirmarSenha} />
                    </button>
                </div>
                
                <button type='button' onClick={createUsers} disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                <div className='footer'>
                    <p>Já possui uma conta?
                        <Link to="/"> Login</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Signup;