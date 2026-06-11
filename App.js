import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';

const API_URL = 'https://6a18c6de23c3626470ac0536.mockapi.io/api/v1/materiais';

export default function App() {
  // --- Estados da Aplicação (Os alunos implementarão aqui) ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');

  // --- Funções de Requisição e Efeitos (Os alunos implementarão aqui) ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Breve descrição do projeto inserida abaixo */}
      <Text style={styles.description}>
        Este template servirá para desenvolver o projeto responsável por modernizar o controle de insumos médicos do almoxarifado. 
        Através desta interface conectada à API, é possível realizar o inventário em tempo real, cadastrar novos materiais e registrar baixas de estoque de forma ágil e segura.
      </Text>

      <Text style={styles.label}>Nome do material</Text>

      <TextInput
        testID="input-nome"
        style={styles.input}
        placeholder="Ex.: Luva de procedimento"
        value={nome}
        onChangeText={setNome}
      />
      <Text style={styles.label}>Quantidade</Text>

      <TextInput
        testID="input-quantidade"
        style={styles.input}
        placeholder="Ex.: 100"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />

      <TouchableOpacity
        testID="btn-cadastrar"
        style={styles.button}
        onPress={() => console.log('Botão cadastrar pressionado')}
      > 
        <Text style={styles.buttonText}>Cadastrar material</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10, // Reduzido ligeiramente para aproximar o texto explicativo
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20, // Dá um espaçamento confortável entre as linhas do parágrafo
    marginBottom: 30, // Margem inferior para afastar o texto dos futuros inputs dos alunos
  },
  label: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 6,
  },
  input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 15,
  backgroundColor: '#fff',
},
button: {
  backgroundColor: '#2E7D32',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 20,
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});