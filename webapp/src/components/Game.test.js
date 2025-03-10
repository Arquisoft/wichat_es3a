//La totalidad de este codigo esta sacado del siguiente repositorio:
//https://github.com/Arquisoft/wiq_es6b/blob/master/webapp/src/components/Game.test.js
//Creditos al equipo correspondiente en su totalidad
//Este codigo ha sido modificado para adaptarse a los requerimientos del proyecto
import { render, screen } from '@testing-library/react';
import Game from './Game';

describe('Game component', () => {
  test('renders without crashing', () => {
    render(<Game username="testUser" totalQuestions={10} timeLimit={180} themes={{}} />);
    expect(screen.getByText(/Pregunta Número 1/i)).toBeInTheDocument();
  });

  test('displays time remaining', () => {
    render(<Game username="testUser" totalQuestions={10} timeLimit={180} themes={{}} />);
    expect(screen.getByText(/¡Tiempo restante 03:00!/i)).toBeInTheDocument();
  });



});