import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';

// --- Constantes de Estilo ---
const ACCENT_COLOR = '#6A92E5';
const LIGHT_BACKGROUND = '#F7F7F7';
const IMAGE_PICK_ICON = '📸'; // Emoji para simular un ícono de imagen

// Simulamos la importación de 'expo-image-picker'. 
// En una aplicación Expo real, esto sería:
// import * as ImagePicker from 'expo-image-picker';

// Componente para manejar mensajes de éxito/error (simulando Alert de RN, pero como UI)
const MessageDisplay = ({ message, type }: { message: string | null, type: 'success' | 'error' | 'info' | null }) => {
    if (!message) return null;

    let bgColor = '#E9F0FD';
    let borderColor = ACCENT_COLOR;
    let textColor = ACCENT_COLOR;

    if (type === 'success') {
        bgColor = '#E8F5E9'; // Verde muy claro
        borderColor = '#4CAF50'; // Verde
        textColor = '#2E7D32'; // Verde oscuro
    } else if (type === 'error') {
        bgColor = '#FFEBEE'; // Rojo muy claro
        borderColor = '#F44336'; // Rojo
        textColor = '#C62828'; // Rojo oscuro
    }

    return (
        <View style={[styles.messageContainer, { backgroundColor: bgColor, borderColor: borderColor }]}>
            <Text style={[styles.messageText, { color: textColor }]}>
                {message}
            </Text>
        </View>
    );
};

export default function AdminAnnouncementsScreen() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    // imageUrl puede ser una URL externa o una URI local (file://...) obtenida del picker
    const [imageUrl, setImageUrl] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | null>(null);

    const clearMessage = () => {
        setMessage(null);
        setMessageType(null);
    }

    // Lógica para adjuntar imagen del dispositivo (usando expo-image-picker)
    const handleImagePick = async () => {
        clearMessage();
        
        // 🛑 SIMULACIÓN DE IMAGE PICKER 🛑
        // En un entorno real, esta llamada abriría la galería:
        /*
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            // result.assets[0].uri sería el URI local (e.g., file:///...)
            setImageUrl(result.assets[0].uri);
            setMessage('Imagen seleccionada del dispositivo.');
            setMessageType('info');
        } else if (!result.canceled) {
            setMessage('Selección de imagen cancelada.');
            setMessageType('error');
        }
        */

        // Usamos una URI de prueba para demostrar la previsualización y la funcionalidad
        const mockUri = "https://placehold.co/600x400/6A92E5/FFFFFF?text=IMAGEN+SELECCIONADA";
        setImageUrl(mockUri);
        setMessage('Funcionalidad de selección de imagen simulada. Se usa una URI de prueba.');
        setMessageType('info');
    };


    // Lógica para publicar el anuncio
    const handleSubmit = async () => {
        clearMessage();
        if (!title.trim() || !body.trim()) {
            setMessage('El título y el cuerpo del anuncio son obligatorios.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        try {
            // Nota: En una app real, si imageUrl es un URI local (file://),
            // primero se debe subir a Firebase Storage o similar para obtener una URL pública.
            
            // 🛑 SIMULACIÓN DE LLAMADA API 🛑
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            setMessage(`Anuncio: "${title}" publicado correctamente.`);
            setMessageType('success');
            setTitle('');
            setBody('');
            setImageUrl('');
        } catch (error) {
            console.error('Error al publicar anuncio:', error);
            setMessage('No se pudo publicar el anuncio. Inténtelo de nuevo.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={LIGHT_BACKGROUND} />
            
            {/* Simulando el PageHeader */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Publicar Anuncios</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.mainTitle}>Crear Nuevo Anuncio</Text>
                
                <MessageDisplay message={message} type={messageType} />

                <View style={styles.formCard}>
                    {/* Título */}
                    <Text style={styles.label}>Título:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Título corto del anuncio"
                        placeholderTextColor="#B0B0B0"
                        value={title}
                        onChangeText={setTitle}
                        editable={!loading}
                    />
                    
                    {/* Cuerpo */}
                    <Text style={styles.label}>Cuerpo del Mensaje:</Text>
                    <TextInput
                        style={[styles.input, styles.bodyInput]}
                        placeholder="Contenido completo del anuncio"
                        placeholderTextColor="#B0B0B0"
                        value={body}
                        onChangeText={setBody}
                        multiline
                        numberOfLines={6}
                        editable={!loading}
                    />

                    {/* Sección de Imagen */}
                    <Text style={[styles.label, { marginTop: 25 }]}>Imagen (Opcional):</Text>
                    
                    {/* Botón de Subir Archivo (Ahora con la lógica de ImagePicker) */}
                    <TouchableOpacity
                        style={[styles.imageButton, loading && styles.buttonDisabled]}
                        onPress={handleImagePick}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.imageButtonText}>
                            {IMAGE_PICK_ICON} Seleccionar imagen desde dispositivo
                        </Text>
                    </TouchableOpacity>

                    {/* Input de URL */}
                    <Text style={[styles.label, { marginTop: 15, marginBottom: 5 }]}>O ingrese URL directa:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://imagen.com/ruta.jpg o vacío"
                        placeholderTextColor="#B0B0B0"
                        value={imageUrl}
                        onChangeText={(text) => { setImageUrl(text); clearMessage(); }}
                        editable={!loading}
                    />

                    {/* Previsualización de la Imagen si hay URL/URI */}
                    {imageUrl.length > 5 && (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                // Usamos un objeto source para manejar URIs o URLs
                                source={{ uri: imageUrl }}
                                style={styles.imagePreview}
                                onError={(e) => console.log('Error al cargar la imagen:', e.nativeEvent.error)}
                            />
                            <Text style={styles.imagePreviewText}>Previsualización</Text>
                        </View>
                    )}
                </View>

                {/* Botón de Publicar */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || !title.trim() || !body.trim()}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Publicar Anuncio</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: LIGHT_BACKGROUND,
    },
    // Estilo del encabezado para simular PageHeader
    headerContainer: {
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    container: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: ACCENT_COLOR,
        marginTop: 20,
        marginBottom: 20,
        lineHeight: 34,
    },
    messageContainer: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 15,
    },
    messageText: {
        fontSize: 14,
        fontWeight: '600',
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D0D0D0',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: LIGHT_BACKGROUND,
        color: '#1A1A1A',
        fontWeight: '400',
    },
    bodyInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    imageButton: {
        backgroundColor: '#E9F0FD',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ACCENT_COLOR,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    imageButtonText: {
        color: ACCENT_COLOR,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    imagePreviewContainer: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#F9F9F9',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        backgroundColor: '#E8E8E8',
        marginBottom: 8,
    },
    imagePreviewText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    button: {
        backgroundColor: ACCENT_COLOR,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ACCENT_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: '#A0BCE4',
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
