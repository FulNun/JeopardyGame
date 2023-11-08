$(document).ready(() => {
    const game = {
        state: {
            selectedCategories: [],
            selectedQuestions: [],
            current: 'question', // 'question' or 'answer'
        },
        elements: {
            gameBoard: $('#game-board'),
            restartButton: $('#restart-button'),
        },
        api: {
            getCategories: () => $.get('http://jservice.io/api/categories', { count: 100 }),
            getCategoryQuestions: (categoryId) => $.get('http://jservice.io/api/clues', { category: categoryId, count: 5 }),
        },
    };

    const getRandomCategories = (categories, n) => (
        [...categories].sort(() => 0.5 - Math.random()).slice(0, n)
    );

    const createGameBoard = () => {
        const table = $('<table>');

        // Create the header row with category names
        const thead = $('<thead>');
        const headerRow = $('<tr>');
        game.state.selectedCategories.forEach(category => {
            const headerCell = $('<th>');
            headerCell.text(category.title);
            headerRow.append(headerCell);
        });
        thead.append(headerRow);
        table.append(thead);

        // Create the table cells for questions and answers with a fixed width and height
        const cellWidth = 150; 
        const cellHeight = 100; 

        const tbody = $('<tbody>');
        for (let row = 0; row < 5; row++) {
            const tableRow = $('<tr>');
            for (let col = 0; col < 6; col++) {
                const tableCell = $('<td>');
                tableCell.addClass('cell');
                tableCell.data('row', row);
                tableCell.data('col', col);
                tableCell.width(cellWidth);
                tableCell.height(cellHeight);
                tableCell.text('?'); // Set the initial content to '?'
                tableRow.append(tableCell);
            }
            tbody.append(tableRow);
        }
        table.append(tbody);

        // Append the table to the HTML
        game.elements.gameBoard.empty().append(table);

        // Set up event handlers for cell clicks
        $('.cell').click(handleCellClick);
    };

    const handleCellClick = function() {
        const row = $(this).data('row');
        const col = $(this).data('col');
        const questionData = game.state.selectedQuestions[col] && game.state.selectedQuestions[col][row];

        if (questionData && game.state.current === 'question') {
            // Replace '?' with the question text
            $(this).text(questionData.question);
            game.state.current = 'answer';
        } else if (questionData && game.state.current === 'answer') {
            // Replace the question with the answer
            $(this).text(questionData.answer);
            game.state.current = 'question';
        }
    };

    const handleRestartClick = () => {
        game.state.selectedCategories = [];
        game.state.selectedQuestions = [];
        game.state.current = 'question';
        fetchCategoriesAndQuestions();
    };

    const handleAPIError = (error) => {
        console.error('Error fetching data from jService API:', error);
        // Error
    };

    const fetchCategoriesAndQuestions = () => {
        game.api.getCategories()
            .then((data) => {
                game.state.selectedCategories.push(...getRandomCategories(data, 6));
                return Promise.all(game.state.selectedCategories.map((category) => game.api.getCategoryQuestions(category.id)));
            })
            .then((questionData) => {
                game.state.selectedQuestions = questionData;
                createGameBoard();
            })
            .catch(handleAPIError);
    };

    game.elements.restartButton.on('click', handleRestartClick);

    fetchCategoriesAndQuestions();
});
