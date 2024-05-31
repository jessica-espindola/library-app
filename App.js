import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import banner from './assets/bookFinder-image.jpg';
import locations from './locations.json'; // Importa o arquivo JSON

const App = () => {
    const [bookTitle, setBookTitle] = useState('');
    const [bookData, setBookData] = useState([]);
    const [view, setView] = useState('home');
    const [location, setLocation] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão de localização não concedida', 'Por favor, conceda permissão de localização para obter a localização.');
                return;
            }
            let locationData = await Location.getCurrentPositionAsync({});
            setLocation(locationData);
        })();
    }, []);

    const handleSearch = async () => {
        if (bookTitle.trim() === '') {
            Alert.alert('Aviso', 'Por favor, insira um título de livro válido.');
            return;
        }
        try {
            const apiUrl = `https://openlibrary.org/search.json?q=${bookTitle}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.num_found > 0) {
                setBookData(data.docs);
            } else {
                Alert.alert('Erro', 'Livro não encontrado. Verifique o título e tente novamente.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Houve um problema na busca do livro. Tente novamente mais tarde.');
        }
    };

    const renderHomeView = () => (
        <View>
            <View style={styles.boxBanner}>
                <Image source={banner} style={styles.banner} />
            </View>
            <TouchableOpacity style={styles.btnHome} onPress={() => setView('search')}>
                <Text style={styles.btnText}>Buscar Livro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnHome} onPress={() => setView('map')}>
                <Text style={styles.btnText}>Ver Livrarias Próximas</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearchView = () => (
        <View>
            <Text style={styles.titulo}>Busca de Livros</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite o nome do livro"
                value={bookTitle}
                onChangeText={(text) => setBookTitle(text)}
            />
            <TouchableOpacity style={styles.btnHome} onPress={handleSearch}>
                <Text style={styles.btnText}>Buscar Livro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnHomeBack} onPress={() => setView('home')}>
                <Text style={styles.btnText}>Voltar</Text>
            </TouchableOpacity>

            {bookData.length > 0 && (
                <ScrollView style={{ margin: 20 }}>
                    {bookData.map((book, index) => (
                        <View key={index} style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{book.title}</Text>
                            <Text>Autor: {book.author_name ? book.author_name.join(', ') : 'N/A'}</Text>
                            <Text>Ano de Publicação: {book.first_publish_year}</Text>
                            <Text>Número de Edições: {book.edition_count}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    const renderMapView = () => (
        <View>
            <TouchableOpacity style={styles.btnHomeBack} onPress={() => setView('home')}>
                <Text style={styles.btnText}>Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTexto}>Verifique no mapa abaixo a sua localização e arraste no mapa para encontrar livrarias.</Text>
            {location && (
                <View>
                    
                    <MapView
                        style={{ width: '100%', height: 300, marginTop: 20 }}
                        initialRegion={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            title="Sua Localização"
                        />
                        {locations.map((loc) => (
                            <Marker
                                key={loc.id}
                                coordinate={{
                                    latitude: loc.latitude,
                                    longitude: loc.longitude,
                                }}
                                title={loc.name}
                            />
                        ))}
                    </MapView>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>Sua Localização</Text>
                    <Text style={{ textAlign: 'center' }}>Latitude: {location.coords.latitude}</Text>
                    <Text style={{ textAlign: 'center' }}>Longitude: {location.coords.longitude}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitulo}>Livraria Online</Text>
                <Text style={styles.headerTexto}>Informações sobre os livros na palma da sua mão.</Text>
            </View>
            {view === 'home' && renderHomeView()}
            {view === 'search' && renderSearchView()}
            {view === 'map' && renderMapView()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'red',
        paddingHorizontal: 15,
        paddingVertical: 30,
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#CFD3F0',
    },
    headerTitulo: {
        paddingBottom: 15,
        fontSize: 20,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    headerTexto: {
        fontSize: 15,
        fontStyle: 'italic',
    },
    boxBanner: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
    },
    banner: {
        width: 300,
        height: 200,
    },
    btnHome: {
        backgroundColor: '#CFD3F0',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    btnHomeBack: {
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CFD3F0',
    },
    btnText: {
        color: 'black',
        fontSize: 16,
    },
    titulo: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        margin: 10,
        padding: 8,
        borderRadius: 10,
        fontSize: 18,
    },
});

export default App;
