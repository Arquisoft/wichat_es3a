const axios = require('axios');
const dataService = require('./questionSaverService');

// Set para rastrear categorías en proceso de generación
const generating = new Set();

// Consultas SPARQL para cada categoría
const wikidataCategoriesQueries = {   
    "country": {  
        query: `
        SELECT ?city ?cityLabel ?country ?countryLabel ?image
        WHERE {
            ?city wdt:P31 wd:Q515.  # Ciudad
            ?city wdt:P17 ?country.  # País de la ciudad
            ?city wdt:P18 ?image.    # Imagen de la ciudad
            ?country wdt:P31 wd:Q6256. # Es un país
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
            ?sport wdt:P18 ?image.    # Imagen del deporte
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
            ?scientist wdt:P31 wd:Q5.  # Es una persona
            ?scientist wdt:P106/wdt:P279* wd:Q901.  # Es científico o relacionado con la ciencia
            ?scientist wdt:P18 ?image.  # Tiene imagen
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
        SELECT ?event ?eventLabel ?image
        WHERE {
            ?event wdt:P31/wdt:P279* wd:Q178561.  # Evento histórico
            ?event wdt:P18 ?image.  # Imagen del evento
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
        SELECT ?painting ?paintingLabel ?image
        WHERE {
            ?painting wdt:P31 wd:Q3305213.  # Pintura
            ?painting wdt:P18 ?image.  # Imagen de la pintura
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
            ?animal wdt:P31/wdt:P279* wd:Q729.  # Animal
            ?animal wdt:P18 ?image.   # Imagen del animal
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    },
};

// Textos de las preguntas para cada categoría
const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?",
    "sports": "¿Qué deporte se muestra en la imagen?",
    "science": "¿Qué científico se muestra en la imagen?",
    "history": "¿Qué evento histórico representa esta imagen?",
    "art": "¿Qué obra de arte se muestra en la imagen?",
    "animals": "¿Qué animal se muestra en la imagen?"
};

const urlApiWikidata = 'https://query.wikidata.org/sparql';

// Función unificada para obtener imágenes de cualquier categoría
async function getImagesForCategory(category, numImages) {
    try {
        if (!wikidataCategoriesQueries[category]) {
            console.error(`Categoría no soportada: ${category}`);
            return [];
        }
        
        // Aumentamos el multiplicador para tener más resultados antes de filtrar
        const multiplier = 5;
        const sparqlQuery = wikidataCategoriesQueries[category].query.replace('?limit', numImages * multiplier);
        
        console.log(`Consultando Wikidata para categoría: ${category}`);
        
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 30000 // Timeout extendido a 30 segundos
        });

        const data = response.data.results.bindings;
        console.log(`Se obtuvieron ${data.length} resultados para ${category}`);
        
        if (data.length === 0) {
            console.error(`No se obtuvieron datos para ${category}`);
            return [];
        }

        let filteredImages = [];

        if (category === "country") {
            filteredImages = data
                .filter(item => 
                    item.cityLabel && item.cityLabel.value &&
                    item.countryLabel && item.countryLabel.value &&
                    item.image && item.image.value
                )
                .slice(0, numImages)
                .map(item => ({
                    city: item.cityLabel.value,
                    country: item.countryLabel.value,
                    imageUrl: item.image.value
                }));
        } else if (category === "science") {
            // Quitamos filtros excesivos para obtener mayor variedad
            filteredImages = data
                .filter(item => 
                    item.scientistLabel && item.scientistLabel.value &&
                    item.image && item.image.value
                )
                .slice(0, numImages)
                .map(item => ({
                    label: item.scientistLabel.value,
                    entity: item.scientist ? item.scientist.value : "",
                    imageUrl: item.image.value
                }));
        } else {
            let entityKey, labelKey;
            switch(category) {
                case "sports": 
                    entityKey = "sport";
                    labelKey = "sportLabel"; 
                    break;
                case "history": 
                    entityKey = "event";
                    labelKey = "eventLabel"; 
                    break;
                case "art": 
                    entityKey = "painting";
                    labelKey = "paintingLabel"; 
                    break;
                case "animals": 
                    entityKey = "animal";
                    labelKey = "animalLabel"; 
                    break;
                default: 
                    console.error(`No se reconoce la categoría: ${category}`);
                    return [];
            }
            
            filteredImages = data
                .filter(item => {
                    return item[labelKey] && item[labelKey].value &&
                           item.image && item.image.value;
                })
                .slice(0, numImages)
                .map(item => ({
                    label: item[labelKey].value,
                    entity: item[entityKey] ? item[entityKey].value : "",
                    imageUrl: item.image.value
                }));
        }
        
        console.log(`Filtrados ${filteredImages.length} elementos con datos completos para ${category}`);
        return filteredImages;
    } catch (error) {
        console.error(`Error obteniendo imágenes para ${category}: ${error.message}`);
        return [];
    }
}

// Función para obtener opciones incorrectas (diferenciando el caso country)
async function getIncorrectOptions(category, correctOption) {
    if (category === "country") {
        return getIncorrectCountriesOptions(correctOption);
    }
    
    let entityType;
    switch(category) {
        case "sports": entityType = "wd:Q349"; break;
        case "science": entityType = "wd:Q901"; break;
        case "history": entityType = "wd:Q178561"; break;
        case "art": entityType = "wd:Q3305213"; break;
        case "animals": entityType = "wd:Q729"; break;
        default: 
            console.error(`Tipo de entidad no configurado para categoría: ${category}`);
            return [];
    }
    
    const sparqlQuery = `
        SELECT DISTINCT ?itemLabel
        WHERE {
            ?item wdt:P31/wdt:P279* ${entityType}.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?itemLabel) = "es")
            FILTER (!REGEX(?itemLabel, "^Q[0-9]"))
        }
        LIMIT 200
    `;

    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query: sparqlQuery, format: 'json' },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 20000
        });

        const options = response.data.results.bindings
            .map(item => item.itemLabel.value)
            .filter(option => 
                option !== correctOption && 
                !option.startsWith("Q") && 
                !option.includes("Q") &&
                option.length > 2
            );
        
        if (options.length < 3) {
            console.log(`Opciones insuficientes para ${category}`);
            return [];
        }
        
        return options.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error obteniendo opciones incorrectas para ${category}: ${error.message}`);
        return [];
    }
}

async function getIncorrectCountriesOptions(correctCountry) {
    const sparqlQuery = `
        SELECT DISTINCT ?countryLabel
        WHERE {
            ?country wdt:P31 wd:Q6256.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
            FILTER(LANG(?countryLabel) = "es")
            FILTER (!REGEX(?countryLabel, "^Q[0-9]"))
        }
        LIMIT 200
    `;

    try {
        const response = await axios.get(urlApiWikidata, {
            params: { query: sparqlQuery, format: 'json' },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            },
            timeout: 20000
        });

        const countries = response.data.results.bindings
            .map(item => item.countryLabel.value)
            .filter(country => 
                country !== correctCountry && 
                !country.startsWith("Q") && 
                !country.includes("Q")
            );
        
        return countries.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error obteniendo países incorrectos: ${error.message}`);
        return [];
    }
}

// Función para procesar las imágenes y crear preguntas según la categoría
async function processQuestions(images, category) {
    let successCount = 0;
    let failedCount = 0;
    
    for (const image of images) {
        try {
            if (category === "country") {
                if (!image.country || !image.imageUrl) {
                    console.log("Imagen con datos incompletos, saltando...");
                    failedCount++;
                    continue;
                }
                
                const incorrectAnswers = await getIncorrectOptions(category, image.country);
                if (incorrectAnswers.length < 3) {
                    console.log(`Opciones incorrectas insuficientes para ${image.city || "ciudad desconocida"}`);
                    failedCount++;
                    continue;
                }

                const options = [image.country, ...incorrectAnswers].sort(() => 0.5 - Math.random());
                const questionText = titlesQuestionsCategories[category];
                
                const newQuestion = {
                    question: questionText,
                    options: options,
                    correctAnswer: image.country,
                    category: category,
                    imageUrl: image.imageUrl
                };
                
                await dataService.saveQuestion(newQuestion);
                successCount++;
                console.log(`Pregunta #${successCount} creada: ${image.city} (${image.country})`);
            } else {
                if (!image.label || !image.imageUrl) {
                    console.log("Imagen con datos incompletos, saltando...");
                    failedCount++;
                    continue;
                }
                
                const incorrectAnswers = await getIncorrectOptions(category, image.label);
                if (incorrectAnswers.length < 3) {
                    console.log(`Opciones incorrectas insuficientes para ${image.label}`);
                    failedCount++;
                    continue;
                }

                const options = [image.label, ...incorrectAnswers].sort(() => 0.5 - Math.random());
                const questionText = titlesQuestionsCategories[category];
                
                const newQuestion = {
                    question: questionText,
                    options: options,
                    correctAnswer: image.label,
                    category: category,
                    imageUrl: image.imageUrl
                };
                
                await dataService.saveQuestion(newQuestion);
                successCount++;
                console.log(`Pregunta #${successCount} creada: ${image.label}`);
            }
        } catch (error) {
            console.error(`Error procesando imagen para ${category}: ${error.message}`);
            failedCount++;
        }
    }
    
    console.log(`Categoría ${category}: ${successCount} preguntas creadas, ${failedCount} fallidas`);
    return successCount;
}

// Función genérica que delega la generación para una categoría
async function generateGenericQuestions(category, numQuestions) {
    const images = await getImagesForCategory(category, numQuestions);
    if (!images || images.length === 0) {
        console.error(`No se pudieron obtener imágenes para categoría: ${category}`);
        return 0;
    }
    const questionsCreated = await processQuestions(images, category);
    return questionsCreated;
}

// Función principal para generar preguntas según la categoría
async function generateQuestionsByCategory(category, numQuestions) {
    if (generating.has(category)) {
        console.log(`Ya se está generando para categoría: ${category}`);
        return 0;
    }
    
    try {
        generating.add(category);
        console.log(`Iniciando generación para categoría: ${category}`);
        
        const questionsCreated = await generateGenericQuestions(category, numQuestions);
        console.log(`Generadas ${questionsCreated} preguntas para categoría: ${category}`);
        return questionsCreated;
    } catch (error) {
        console.error(`Error generando preguntas para ${category}: ${error.message}`);
        return 0;
    } finally {
        generating.delete(category);
        console.log(`Generación para ${category} completada`);
    }
}

// Función para verificar si una categoría está en proceso de generación
function isGenerating(category) {
    return generating.has(category);
}

module.exports = {
    generateQuestionsByCategory,
    isGenerating
};