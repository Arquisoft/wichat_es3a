const axios = require('axios');
const dataService = require('./questionSaverService');

const generating = new Set(); 

const labelKeys = {
    country: "countryLabel",
    sports: "sportLabel",
    science: "scientistLabel",
    history: "personLabel",
    art: "artistLabel",
    animals: "animalLabel",
};

const wikidataCategoriesQueries = {   
    "country": {  
        query: `
        SELECT ?city ?cityLabel ?country ?countryLabel ?image
        WHERE {
            ?city wdt:P31 wd:Q515.  # Ciudad
            ?city wdt:P17 ?country.  # País de la ciudad
            OPTIONAL { ?city wdt:P18 ?image. }  # Imagen de la ciudad (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "sports": {
        query: `
        SELECT ?sport ?sportLabel ?image
        WHERE {
            ?sport wdt:P31 wd:Q349.  # Deporte
            OPTIONAL { ?sport wdt:P18 ?image. }  # Imagen del deporte (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "science": {
        query: `
        SELECT ?scientist ?scientistLabel ?image
        WHERE {
            ?scientist wdt:P31 wd:Q5.  # Científico
            OPTIONAL { ?scientist wdt:P18 ?image. }  # Imagen del científico (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "history": {
        query: `
        SELECT ?person ?personLabel ?image
        WHERE {
            ?person wdt:P31 wd:Q5.  # Persona
            OPTIONAL { ?person wdt:P18 ?image. }  # Imagen de la persona (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
    "art": {
        query: `
       SELECT ?painting ?artistLabel ?image
        WHERE {
            ?painting wdt:P31 wd:Q3305213.  # Elemento que sea una pintura
            ?painting wdt:P170 ?artist.  # Relación con el artista
            ?artist rdfs:label "NOMBRE_DEL_ARTISTA"@es.  # Filtrar por el nombre del artista (ajústalo según sea necesario)
            
            OPTIONAL { ?painting wdt:P18 ?image. }  # Imagen de la pintura (opcional)
            
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    }, 
    "animals": {
        query: `
        SELECT ?animal ?animalLabel ?image
        WHERE {
            ?animal wdt:P31 wd:Q729.  # Animal
            OPTIONAL { ?animal wdt:P18 ?image. }  # Imagen del animal (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },

};

const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?",
    "sports": "¿Qué deporte se muestra en la imagen?",
    "science": "¿Quién es la persona en la imagen?",
    "history": "¿Quién es la persona en la imagen?",
    "art": "¿Quién es el artista de esta pintura?",
    "animals": "¿Qué animal se muestra en la imagen?"
};

const urlApiWikidata = 'https://query.wikidata.org/sparql';

// Obtener imágenes de una categoría en Wikidata
async function getImagesFromWikidata(category, numImages) {
    const categoryQueries = wikidataCategoriesQueries[category];
    const sparqlQuery = categoryQueries.query.replace('?limit', `${numImages}`);

    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query: sparqlQuery, format: 'json' },
            headers: { 'User-Agent': 'QuestionGeneration/1.0' }
        });

        const labelKey = labelKeys[category];
        const data = response.data.results.bindings;

        const filteredImages = data
            .filter(item => item.image && item[labelKey])  // Filtrar solo los elementos con ciudad e imagen
            .slice(0, numImages)  // Limitar la cantidad de imágenes a `numImages`
            .map(item => ({
                imageUrl: item.image.value,
                label: item[labelKey].value
            }));
        console.log(`filter: ${filteredImages}`);
        return filteredImages;

    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        return [];
    }
}


async function getIncorrect(correctOption, category) {
    const queryIncorrectCountry = `
        SELECT DISTINCT ?countryLabel
        WHERE {
            ?country wdt:P31 wd:Q6256.  # Q6256 = país
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorretcSport = `
        SELECT DISTINCT ?sportLabel
        WHERE {
            ?sport wdt:P31 wd:Q349.  # Q349 = deporte
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectScience = `
        SELECT DISTINCT ?scientistLabel
        WHERE {
            ?scientist wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectHistory = `
        SELECT DISTINCT ?personLabel
        WHERE {
            ?person wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectArt = `
        SELECT DISTINCT ?artistLabel
        WHERE {
            ?artist wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;
    const queryIncorrectAnimals = `
        SELECT DISTINCT ?animalLabel
        WHERE {
            ?animal wdt:P31 wd:Q5.  # Q5 = persona
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;

    const queries = {
        "country": queryIncorrectCountry,
        "sports": queryIncorretcSport,
        "science": queryIncorrectScience,
        "history": queryIncorrectHistory,
        "art": queryIncorrectArt,
        "animals": queryIncorrectAnimals,
    };

    const incorrectQuery = queries[category];
    const labelKey = labelKeys[category];

    try {
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: incorrectQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const data = response.data.results.bindings.map(item => item[labelKey].value);
        const incorrectOptions = data.filter(topic => topic !== correctOption);
        
        // Seleccionamos aleatoriamente 3 opciones incorrectas
        return incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error retrieving countries: ${error.message}`);
        return [];
    }
}

async function processQuestions(images, category) {
    const incorrectPool = await fetchIncorrectOptionsForCategory(category);
    if (incorrectPool.length < 3) return;

    const allQuestions = [];

    for (const image of images) {
        const incorrectAnswers = incorrectPool
            .filter(opt => opt !== image.label)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        if (incorrectAnswers.length < 3) return;

        const options = [image.label, ...incorrectAnswers].sort(() => 0.5 - Math.random());

        allQuestions.push({
            question: titlesQuestionsCategories[category],
            options,
            correctAnswer: image.label,
            category,
            imageUrl: image.imageUrl
          });

    }
    await dataService.saveQuestionsBatch(allQuestions);
}


async function fetchIncorrectOptionsForCategory(category) {
    const queries = {
        "country": `
            SELECT DISTINCT ?countryLabel WHERE {
                ?country wdt:P31 wd:Q6256.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 200
        `,
        "sports": `
            SELECT DISTINCT ?sportLabel WHERE {
                ?sport wdt:P31 wd:Q349.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 200
        `,
        "science": `
            SELECT DISTINCT ?scientistLabel WHERE {
                ?scientist wdt:P31 wd:Q5.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 200
        `,
        "history": `
            SELECT DISTINCT ?personLabel WHERE {
                ?person wdt:P31 wd:Q5.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 200
        `,
        "art": `
            SELECT DISTINCT ?artistLabel WHERE {
                ?artist wdt:P31 wd:Q5.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 200
        `,
        "animals": `
            SELECT DISTINCT ?animalLabel WHERE {
                ?animal wdt:P31 wd:Q729.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            } LIMIT 200
        `,
    };

    const labelKeys = {
        country: "countryLabel",
        sports: "sportLabel",
        science: "scientistLabel",
        history: "personLabel",
        art: "artistLabel",
        animals: "animalLabel"
    };

    const query = queries[category];
    const labelKey = labelKeys[category];

    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query, format: 'json' },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const options = response.data.results.bindings.map(item => item[labelKey]?.value).filter(Boolean);
        return [...new Set(options)]; // eliminar duplicados
    } catch (error) {
        console.error(`Error al obtener opciones incorrectas para ${category}:`, error.message);
        return [];
    }
}


// Generate questions
async function generateQuestionsByCategory(category, quantity) {
    if (generating.has(category)) return;
    generating.add(category);

    try {
        await getImagesFromWikidata(category, quantity)
            .then(images => processQuestions(images, category));
    } finally {
        generating.delete(category);
    }
}

module.exports = {
    generateQuestionsByCategory
};