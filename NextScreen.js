import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const NextScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [search, setSearch] = useState('');
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposDetalhados, setTiposDetalhados] = useState([]);
  const [error, setError] = useState(null);
  const [pokemons, setPokemons] = useState([]);
  const [pokemonsJogos, setPokemonsJogos] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [pokemonAleatorios, setPokemonAleatorios] = useState([]);
  const [opcaoCerta, setOpcaoCerta] = useState(null);
  const [imagemID, setImagemID] = useState(null);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);

  const [fontsLoaded] = useFonts({
    'Pokemon Classic': require('./assets/fonts/Pokemon.Classic.ttf'),
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        'https://pokeapi.co/api/v2/pokemon?limit=1015'
      );
      const data = await response.json();
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon) => {
          const detailsResponse = await fetch(pokemon.url);
          const details = await detailsResponse.json();
          return {
            id: details.id,
            name: pokemon.name,
            image: details.sprites.front_default,
            types: details.types.map((typeInfo) => typeInfo.type.name),
          };
        })
      );
      setPokemons(detailedPokemons);
      setFilteredPokemons(detailedPokemons);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (search === '') {
      setFilteredPokemons(pokemons);
    } else {
      const filtered = pokemons.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPokemons(filtered);
    }
  }, [search, pokemons]);
   useEffect(() => {
        const fetchPokeTipos = async () => {
            try {
                const response = await fetch('https://pokeapi.co/api/v2/type');
                const poketipos = await response.json();

                let tiposOrdenados = poketipos.results.map((pokemon) => pokemon.name).sort();
                setTipos(tiposOrdenados);
                const detalhes = await Promise.all(
                    tiposOrdenados.map(async (tipo, index) => {
                        if (index === 17 || index === 18) return null;
                        try {
                            const responseTipo = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
                            const tipobytipo = await responseTipo.json();

                            const fraquezas = tipobytipo.damage_relations.double_damage_from.map((t) => t.name).join(', ');
                            const resistencias = tipobytipo.damage_relations.half_damage_from.map((t) => t.name).join(', ');
                            const vantagens = tipobytipo.damage_relations.double_damage_to.map((t) => t.name).join(', ');
                            const desvantagensAtaque = tipobytipo.damage_relations.half_damage_to.map((t) => t.name).join(', ');

                            const pokemons = tipobytipo.pokemon.map((p) => p.pokemon.name);

                            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemons[0]}`);
                            const poketipodata = await pokemonResponse.json();

                            const ID = poketipodata.id;

                            return {
                                tipo,
                                fraquezas,
                                resistencias,
                                vantagens,
                                desvantagensAtaque,
                                pokemons,
                                imagem: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ID}.png`,
                            };
                        } catch {
                            return null;
                        }
                    })
                );

                setTiposDetalhados(detalhes.filter((detalhe) => detalhe !== null));
            } catch (err) {
                console.error('Erro ao buscar os tipos de Pokémon:', err);
                setError(err);
            }
        };

        fetchPokeTipos();
    }, []);
    
  const tipoCores = {
    normal: '#919AA2',
    fire: '#FF9D55',
    water: '#5090D6',
    electric: '#F6AD3A',
    grass: '#63BC5A',
    ice: '#73CEC0',
    fighting: '#CE416B',
    poison: '#B567CE',
    ground: '#D97845',
    flying: '#89AAE3',
    psychic: '#FA7179',
    bug: '#91C12F',
    rock: '#C5B78C',
    ghost: '#5269AD',
    dragon: '#0B6DC3',
    dark: '#5A5465',
    steel: '#5A8EA2',
    fairy: '#EC8FE6',
};
   useEffect(() => {
  const carregarPokemons = async () => {
    try {
      const responsejogo = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1015');
      const pokeJogos = await responsejogo.json();
      setPokemonsJogos(pokeJogos.results.map(pokemon => pokemon.name));
    } catch (error) {
      console.error("Erro ao buscar o Pokémon:", error);
    }
  };

  carregarPokemons();
}, []);

useEffect(() => {
  if (pokemonsJogos.length > 0 && pontos < 250) {
    gerarPergunta();
  }
}, [pokemonsJogos, pontos]);

const gerarPergunta = async () => {
  let pokemonAleatorios = [];
  let i = 0;
  while (i < 4) {
    const pokeIndex = Math.floor(Math.random() * pokemonsJogos.length);
    pokemonAleatorios.push(pokemonsJogos[pokeIndex]);
    i++;
  }

  const opcaoCerta = Math.floor(Math.random() * pokemonAleatorios.length);
  const responsePokeCertoImagem = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonAleatorios[opcaoCerta]}`);
  const imagemCertodata = await responsePokeCertoImagem.json();
  setImagemID(imagemCertodata.id);
  setOpcaoCerta(opcaoCerta);
  setPokemonAleatorios(pokemonAleatorios);
  setRespostaSelecionada(null); // Limpa a resposta selecionada antes de gerar a próxima pergunta
};

const handleResposta = (value) => {
  setRespostaSelecionada(value);
  if (value === pokemonAleatorios[opcaoCerta]) {
    setPontos(pontos + 10);
  } else {
    setPontos(pontos - 10);
  }
};
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return (
          <View style={[styles.container, styles.homeContainer]}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.imageContainer}>
              <Image
                source={require('./assets/professor-carvalho.png')}
                style={styles.professorImage}
                resizeMode="contain"
              />
              <Image
                source={require('./assets/bichin.png')}
                style={styles.nidoranImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.description}>
              Este app é uma homenagem ao universo Pokémon, onde você pode
              explorar a rica história dos jogos e interagir com personagens
              icônicos.
            </Text>
          </View>
        );

        
      case 'Funcionalidade':
        return (
          <View style={[styles.container, styles.funcionalidadeContainer]}>
            <Text style={styles.description}>Listagem e Filtro:</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquise o Pokémon"
                placeholderTextColor="#8A8D91"
                value={search}
                onChangeText={setSearch}
              />
              <FontAwesome
                name="search"
                size={20}
                color="#395FAA"
                style={styles.searchIcon}
              />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.pokemonList}>
                {filteredPokemons.map((pokemon) => (
                  <View key={pokemon.id} style={styles.pokemonContainer}>
                    <Image
                      source={{ uri: pokemon.image }}
                      style={styles.pokemonImage}
                    />
                    <View style={styles.pokemonInfo}>
                      <Text style={styles.pokemonName}>{pokemon.name}</Text>
                      <View style={styles.typeContainer}>
                        {pokemon.types.map((type, index) => (
                          <Text
                            key={index}
                            style={[styles.typeText, styles[type]]}>
                            {type}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      case 'Explore':
return (
        
        <ScrollView contentContainerStyle={styles.container}>
         <View >
        <Text style={styles.description}>Navegue pela enciclopédia dos tipos Pokémon</Text>
      </View>
            {error ? (
                <Text style={styles.error}>Erro ao carregar os tipos de Pokémon</Text>
            ) : (
                tiposDetalhados.map((detalhes) => (
                   <View
    style={[
        styles.containerInfo,
        { backgroundColor: tipoCores[detalhes.tipo] || '#FFFFFF' }, // Cor padrão branca
    ]}
    key={detalhes.tipo}
>

    <View style={styles.texto}>
        <Text style={styles.tipoHeader}>Tipo: {detalhes.tipo}</Text>
        <Text><Text style={styles.bold}>Fraquezas:</Text> {detalhes.fraquezas}</Text>
        <Text><Text style={styles.bold}>Resistências:</Text> {detalhes.resistencias}</Text>
        <Text><Text style={styles.bold}>Vantagens:</Text> {detalhes.vantagens}</Text>
        <Text><Text style={styles.bold}>Desvantagens:</Text> {detalhes.desvantagensAtaque}</Text>
        <Text><Text style={styles.bold}>Pokémons:</Text> {detalhes.pokemons.slice(0, 5).join(', ')}</Text>
    </View>
</View>
                ))
            )}
        </ScrollView>
    );
      case 'Game':
         return (
<View style={styles.container}>
         <View >
        <Text style={styles.description}>Quem é esse pokémon!?</Text>
      </View>
  <View style={styles.pontuacao}>
    <Text>Pontos: {pontos}</Text>
  </View>
  <View style={styles.imagemQuest}>
    {imagemID && <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${imagemID}.png` }} style={styles.image} />}
  </View>
  <View style={styles.opcoes}>
    {pokemonAleatorios.length > 0 && pokemonAleatorios.map((pokemon, index) => {
      let buttonColor = ''; // Cor padrão

      if (respostaSelecionada !== null) {
        // Altera a cor dependendo se a resposta está correta ou errada
        if (pokemon === pokemonAleatorios[opcaoCerta] && respostaSelecionada === pokemon) {
          buttonColor = 'green'; // Resposta certa
        } else if (respostaSelecionada === pokemon) {
          buttonColor = 'red'; // Resposta errada
        }
      }

      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleResposta(pokemon)}
          style={[styles.answerButtonsContainer, { backgroundColor: buttonColor }]} // Aplica a cor ao TouchableOpacity
        >
          <Text style={styles.answerText}>{pokemon}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>
  );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('Home')}>
          <FontAwesome
            name="home"
            size={30}
            color={currentScreen === 'Home' ? '#F6AD3A' : '#395FAA'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('Funcionalidade')}>
          <FontAwesome
            name="list-ul"
            size={30}
            color={currentScreen === 'Funcionalidade' ? '#F6AD3A' : '#395FAA'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('Explore')}>
          <FontAwesome
            name="globe"
            size={30}
            color={currentScreen === 'Explore' ? '#F6AD3A' : '#395FAA'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('Game')}>
          <FontAwesome
            name="gamepad"
            size={30}
            color={currentScreen === 'Game' ? '#F6AD3A' : '#395FAA'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FDF3C2',
    paddingTop: 20,
    paddingBottom: 120,
  },
  logo: {
    width: 150,
    height: 80,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    marginTop: 20,
  },
  professorImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 180,
    height: 180,
  },
  nidoranImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 80,
    height: 80,
  },
  description: {
    marginTop: 30,
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#333',
    textAlign: 'justify',
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'Pokemon Classic',
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#FFF',
    borderTopWidth: 2,
    borderTopColor: '#411B17',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    height: 50,
    borderRadius: 30,
    marginTop: 20,
  },
  searchInput: {
    height: 40,
    width: '100%',
    fontSize: 14,
    color: '#333',
    paddingLeft: 40,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  pokemonList: {
    width: '100%',
    alignItems: 'center',
  },
  pokemonContainer: {
    flexDirection: 'row', // Organiza a imagem e as informações na horizontal
    margin: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '90%', // Ajuste para ocupar boa parte da largura
    alignItems: 'center',
  },
  pokemonImage: {
    width: 80,
    height: 80,
    marginRight: 15, // Espaço entre a imagem e as informações
  },
  pokemonInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
  },
  typeText: {
    marginRight: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    color: '#FFF',
    textTransform: 'capitalize',
  },

  // Cores para os tipos de Pokémon
  grass: { backgroundColor: '#63BC5A' },
  fire: { backgroundColor: '#FF9D55' },
  water: { backgroundColor: '#5090D6' },
  electric: { backgroundColor: '#F6AD3A' },
  bug: { backgroundColor: '#91C12F' },
  normal: { backgroundColor: '#919AA2' },
  poison: { backgroundColor: '#B567CE' },
  ground: { backgroundColor: '#D97845' },
  rock: { backgroundColor: '#C5B78C' },
  fighting: { backgroundColor: '#CE416B' },
  psychic: { backgroundColor: '#FA7179' },
  ghost: { backgroundColor: '#5269AD' },
  ice: { backgroundColor: '#73CEC0' },
  dragon: { backgroundColor: '#0B6DC3' },
  fairy: { backgroundColor: '#EC8FE6' },
  dark: { backgroundColor: '#5A5465' },
  steel: { backgroundColor: '#5A8EA2' },

  roundedContainer: {
    width: '80%',
    maxHeight: 300,
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    justifyContent: 'center',
    flexShrink: 1,
  },
  containerTextTopRight: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  textBoxBottom: {
    marginTop: 10,
    backgroundColor: '#395FAA',
    padding: 10,
    borderRadius: 10,
  },
  textBoxText: {
    fontSize: 14,
    color: '#FFF',
  },
  pokemonImageContainer: {
    width: 200,
    height: 200,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButtonsContainer: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  answerButton: {
    backgroundColor: '#F3E600',
    padding: 15,
    borderRadius: 30,
    width: '45%',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#395FAA',
  },
  nextButton: {
    backgroundColor: '#F6AD3A',
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  containerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '80%',

        fontFamily: 'Pokemon Classic',
    },

    image: {
        width: 150,
        height: 100,
        borderRadius: 10,
    },
    pokemonName: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Pokemon Classic',
    },
    texto: {
        flex: 1,
        marginLeft: 10,
       fontFamily: 'Pokemon Classic',
        
    },
    tipoHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Pokemon Classic',
    },
    bold: {
        fontWeight: 'bold',
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
     pontuacao: {
    marginBottom: 20,
  },
  imagemQuest: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Espaço entre a imagem e as opções
  },
  image: {
    width: 200,
    height: 200, // Tamanho da imagem
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10, // Espaçamento entre os botões
  },
  answerButtonsContainer: {
    width: '40%', // Botões ocupando 40% da largura do container
    aspectRatio: 1, // Botões quadrados
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEB3B',
    borderRadius: 10, 
 
  },
  answerText: {
    color: '#1E88E5', // Texto azul
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    height:30
  },

});

export default NextScreen;
