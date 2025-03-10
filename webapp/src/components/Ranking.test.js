//La totalidad de este codigo esta sacado del siguiente repositorio:
//https://github.com/Arquisoft/wiq_es6b/blob/master/webapp/src/components/RankingList.test.js
//Creditos al equipo correspondiente en su totalidad
//Este codigo ha sido modificado para adaptarse a los requerimientos del proyecto
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import RankingList from './RankingList';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

jest.mock('axios');

const mockAxios = new MockAdapter(axios);

describe('RankingList', () => {
  describe('successful requests', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        status: 200,
        data: [
          {
            username: "manuel",
            porcentajeAciertos: 90,
            preguntasCorrectas: 180,
            preguntasFalladas: 20,
            numPartidas: 200,
          },
          {
            username: "maría",
            porcentajeAciertos: 50,
            preguntasCorrectas: 200,
            preguntasFalladas: 200,
            numPartidas: 400,
          },
          {
            username: "pedro",
            porcentajeAciertos: 22,
            preguntasCorrectas: 22,
            preguntasFalladas: 78,
            numPartidas: 100,
          },
          {
            username: "troll",
            porcentajeAciertos: 5,
            preguntasCorrectas: 15,
            preguntasFalladas: 285,
            numPartidas: 300,
          },
        ],
      });
    });

    function emptyFunction() {  
      return;
    }

    async function renderRankingList() {
      await act(async () => {
        render(<RankingList setError={emptyFunction} />);
      });
    }

    it('renders without crashing', async () => {
      await renderRankingList();
    });


    test('renders RankingList component and main heading', async () => {
      await renderRankingList();

      // Check if the main heading is in the document
      const heading = screen.getByRole('heading', { name: /Top 3 usuarios con mejor porcentaje de aciertos/i });
      expect(heading).toBeInTheDocument();
    });

    // Test for rendering the column headers
    test('renders column headers', async () => {
      await renderRankingList();
    
      // Check if the column headers are in the document
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).not.toHaveLength(0);
    });
    
    // Test for rendering the table
    it('should display the table', async () => {
      await renderRankingList();

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });


    test('tests tabla ranking', async () => {
      await renderRankingList();

      expect(screen.queryByText("Ranking")).toBeInTheDocument();
      expect(screen.getByText(/Nombre de Usuario/i)).toBeInTheDocument();
      expect(screen.queryAllByText(/Porcentaje de Aciertos/i)).not.toHaveLength(0);
      expect(screen.getByText(/Preguntas Correctas/i)).toBeInTheDocument();
      expect(screen.getByText(/Preguntas Falladas/i)).toBeInTheDocument();
      expect(screen.getByText(/Número de Partidas/i)).toBeInTheDocument();
    });

    test('show ranking table with content', async () => {
      await renderRankingList();
  
      const rows = await screen.findAllByRole('row');
      expect(rows).toHaveLength(5);
    });

    test('show users ordered by "porcentajeAciertos" BY DEFAULT correctly', async () => {
      await renderRankingList();
      
      // We wait for the users to be loaded and the table to be updated
      let rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'manuel'
      expect(rows[1]).toHaveTextContent('manuel');
      expect(rows[2]).toHaveTextContent('maría');
      expect(rows[3]).toHaveTextContent('pedro');
      expect(rows[4]).toHaveTextContent('troll');

    });

    test('show users ordered by "username" correctly', async () => {
      await renderRankingList();
      const usernameHeader = screen.getByRole('columnheader', { name: /Nombre de Usuario/i });
      
      await act(async() => {
        usernameHeader.click(); // DESC
      });

      // We wait for the users to be loaded and the table to be updated
      let rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'troll'
      expect(rows[4]).toHaveTextContent('manuel');
      expect(rows[3]).toHaveTextContent('maría');
      expect(rows[2]).toHaveTextContent('pedro');
      expect(rows[1]).toHaveTextContent('troll');

      await act(async() => {
        usernameHeader.click(); // ASC
      });

      // We wait for the users to be loaded and the table to be updated
      rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'manuel'
      expect(rows[1]).toHaveTextContent('manuel');
      expect(rows[2]).toHaveTextContent('maría');
      expect(rows[3]).toHaveTextContent('pedro');
      expect(rows[4]).toHaveTextContent('troll');
      
    });

    test('show users ordered by "porcentajeAciertos" correctly', async () => {
      await renderRankingList();
      const porcentajeAciertosHeader = screen.getByRole('columnheader', { name: /Porcentaje de Aciertos/i });
      
      await act(async() => {
        porcentajeAciertosHeader.click(); // ASC
      });

      // We wait for the users to be loaded and the table to be updated
      let rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'troll'
      expect(rows[4]).toHaveTextContent('manuel');
      expect(rows[3]).toHaveTextContent('maría');
      expect(rows[2]).toHaveTextContent('pedro');
      expect(rows[1]).toHaveTextContent('troll');

      await act(async() => {
        porcentajeAciertosHeader.click(); // DESC
      });

      // We wait for the users to be loaded and the table to be updated
      rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'manuel'
      expect(rows[1]).toHaveTextContent('manuel');
      expect(rows[2]).toHaveTextContent('maría');
      expect(rows[3]).toHaveTextContent('pedro');
      expect(rows[4]).toHaveTextContent('troll');
      
    });

    test('show users ordered by "preguntasCorrectas" correctly', async () => {
      await renderRankingList();
      const preguntasCorrectasHeader = screen.getByRole('columnheader', { name: /Preguntas Correctas/i });
      
      await act(async() => {
        preguntasCorrectasHeader.click(); // DESC
      });

      // We wait for the users to be loaded and the table to be updated
      let rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'maría'
      expect(rows[2]).toHaveTextContent('manuel');
      expect(rows[1]).toHaveTextContent('maría');
      expect(rows[3]).toHaveTextContent('pedro');
      expect(rows[4]).toHaveTextContent('troll');

      await act(async() => {
        preguntasCorrectasHeader.click(); // ASC
      });

      // We wait for the users to be loaded and the table to be updated
      rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'troll'
      expect(rows[3]).toHaveTextContent('manuel');
      expect(rows[4]).toHaveTextContent('maría');
      expect(rows[2]).toHaveTextContent('pedro');
      expect(rows[1]).toHaveTextContent('troll');
    });

    test('show users ordered by "preguntasFalladas" correctly', async () => {
      await renderRankingList();
      const preguntasFalladasHeader = screen.getByRole('columnheader', { name: /Preguntas Falladas/i });
      
      await act(async() => {
        preguntasFalladasHeader.click(); // DESC
      });

      // We wait for the users to be loaded and the table to be updated
      let rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'maría'
      expect(rows[4]).toHaveTextContent('manuel');
      expect(rows[2]).toHaveTextContent('maría');
      expect(rows[3]).toHaveTextContent('pedro');
      expect(rows[1]).toHaveTextContent('troll');

      await act(async() => {
        preguntasFalladasHeader.click(); // ASC
      });

      // We wait for the users to be loaded and the table to be updated
      rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'manuel'
      expect(rows[1]).toHaveTextContent('manuel');
      expect(rows[3]).toHaveTextContent('maría');
      expect(rows[2]).toHaveTextContent('pedro');
      expect(rows[4]).toHaveTextContent('troll');
    });

    test('show users ordered by "numeroPartidas" correctly', async () => {
      await renderRankingList();
      const numPartidasHeader = screen.getByRole('columnheader', { name: /Número de Partidas/i });
      
      await act(async() => {
        numPartidasHeader.click(); // DESC
      });

      // We wait for the users to be loaded and the table to be updated
      let rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'maría'
      expect(rows[3]).toHaveTextContent('manuel');
      expect(rows[1]).toHaveTextContent('maría');
      expect(rows[4]).toHaveTextContent('pedro');
      expect(rows[2]).toHaveTextContent('troll');

      await act(async() => {
        numPartidasHeader.click(); // ASC
      });

      // We wait for the users to be loaded and the table to be updated
      rows = await screen.findAllByRole('row');

      // We check if the first row is the one with the username 'pedro'
      expect(rows[2]).toHaveTextContent('manuel');
      expect(rows[4]).toHaveTextContent('maría');
      expect(rows[1]).toHaveTextContent('pedro');
      expect(rows[3]).toHaveTextContent('troll');
    });

  }); // fin tests correctos

  test('should display an error message when the request fails', async () => {
    let errorShown = "";
      await act(async () => {
        render(<RankingList setError={(errorMsg) => {errorShown=errorMsg}} />);
      });

    // simulate a failed request
    mockAxios.onPost('http://localhost:8000/obtainRank').reply(500, { error: 'Internal Server Error' });

    // Check if the table headers are in the document 
    expect(screen.queryByText("Ranking")).toBeInTheDocument();
    expect(screen.getByText(/Nombre de Usuario/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Porcentaje de Aciertos/i)).not.toHaveLength(0);
    expect(screen.getByText(/Preguntas Correctas/i)).toBeInTheDocument();
    expect(screen.getByText(/Preguntas Falladas/i)).toBeInTheDocument();
    expect(screen.getByText(/Número de Partidas/i)).toBeInTheDocument();

    // and no users rows are shown
    const rows = await screen.findAllByRole('row');
    expect(rows.length).toBe(1);

    expect(errorShown).toBe("Error obteniendo el ranking del usuario: TypeError: Cannot read properties of undefined (reading 'status')");
  });

});