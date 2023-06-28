describe('API testing on swapi API', () => {

    it('should check that there are exactly nine Star Wars movies', () => { 
        cy.request('GET', 'films')
        .its('body.count')
        .then((count) => {
            expect(count).to.equal(9);
        });
    });

    it('should verify Luke Skywalker\'s appearances', () => { 
        cy.request('GET', 'people')
        .its('body.results')
        .then((characters) => {
            const lukeSkywalker = characters.find((character: any) => character.name === 'Luke Skywalker');
            expect(lukeSkywalker).to.exist;

            cy.wrap(lukeSkywalker.films).each((filmUrl) => {
                cy.request('GET', filmUrl)
                .its('body.title')
                .then((title) => {
                    const starWarsMovies = [
                        'A New Hope',
                        'The Empire Strikes Back',
                        'Return of the Jedi',
                        'The Phantom Menace',
                        'Revenge of the Sith',
                    ];
                    expect(starWarsMovies).to.include(title);
                });
            });
        });
    });

    it('should check that Human is the most common species', () => { 
        let allSpecies = [];

        cy.request('GET', 'species').then((response) => {
        const totalSpeciesPages = Math.ceil(response.body.count / response.body.results.length);

        const fetchSpeciesPage = (page) => {
            cy.request('GET', `species?page=${page}`).then((response) => {
            allSpecies = allSpecies.concat(response.body.results);

            if (page < totalSpeciesPages) {
                fetchSpeciesPage(page + 1);
            } else {
                const humanSpecies = allSpecies.find((s) => s.name === 'Human');
                expect(humanSpecies).to.exist;

                const humanSpeciesCount = humanSpecies.people.length;

                allSpecies.forEach((species) => {
                    if (species.name !== 'Human') {
                        expect(species.people.length).to.be.at.most(humanSpeciesCount);
                    }
                });
            }
            });
        };

        fetchSpeciesPage(1);
        });
    });

    it('should check that all characters are listed in at least one movie', () => { 
        cy.request('GET', 'people')
        .then((response) => {
            const totalPages = Math.ceil(response.body.count / response.body.results.length);

            for (let page = 1; page <= totalPages; page++) {
                cy.request('GET', `people?page=${page}`)
                .its('body.results')
                .then((characters) => {
                    cy.wrap(characters).each((character: any) => {
                        const characterId = character.url.split('/').slice(-2)[0];
                        expect(characterId).to.exist;

                        cy.request('GET', `people/${characterId}/`)
                        .its('body.films')
                        .then((films) => {
                            expect(films).to.have.lengthOf.at.least(1);
                        });
                    });
                });
            }
        });
    });


    it('should check that characters listed in a movie have detailed records', () => { 
        cy.request('GET', 'films')
        .its('body.results')
        .then((films) => {
            cy.wrap(films).each((film: any) => {
                const characters = film.characters;
                expect(film.characters).to.have.lengthOf.at.least(1);
                
                cy.wrap(characters).each((characterUrl) => {
                    cy.request('GET', characterUrl)
                    .its('body')
                    .then((character) => {
                        expect(character.name).to.exist;
                        expect(character.height).to.exist;
                        expect(character.mass).to.exist;
                        expect(character.hair_color).to.exist;
                        expect(character.skin_color).to.exist;
                        expect(character.eye_color).to.exist;
                    });
                });
            });
        });
    });

    it('should check that no character is resident on more than one planet', () => { 
        cy.request('GET', 'people')
        .its('body.results')
        .then((characters) => {
            const planetCounts = {};

            cy.wrap(characters).each((character: any) => {
            const homeworldUrl = character.homeworld;

            cy.request('GET', homeworldUrl)
                .its('body')
                .then((homeworld) => {
                const planetName = homeworld.name;

                if (planetCounts[planetName]) {
                    assert.fail(`Character '${character.name}' is resident on more than one planet.`);
                } else {
                    planetCounts[planetName] = true;
                }
                });
            });
        });
    });

});
