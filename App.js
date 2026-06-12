import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";

const API_URL = "https://6a18c6de23c3626470ac0536.mockapi.io/api/v1/materiais";

export default function App() {
  // --- Estados da Aplicação (Os alunos implementarão aqui) ---
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // --- Funções de Requisição e Efeitos (Os alunos implementarão aqui) ---
  const buscarMateriais = async () => {
    try {
      setCarregando(true);

      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error("Não foi possível buscar os materiais.");
      }

      const dados = await resposta.json();

      setMateriais(dados);
    } catch (erro) {
      console.error("Erro ao buscar materiais:", erro);
    } finally {
      setCarregando(false);
    }
  };

  const validarFormulario = () => {
    const nomeTratado = nome.trim();
    const quantidadeNumerica = Number(quantidade);

    if (!nomeTratado) {
      Alert.alert("Atenção", "Informe o nome do material.");
      return null;
    }

    if (!quantidade.trim()) {
      Alert.alert("Atenção", "Informe a quantidade do material.");
      return null;
    }

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica <= 0) {
      Alert.alert(
        "Atenção",
        "A quantidade deve ser um número inteiro maior que zero.",
      );

      return null;
    }

    return {
      nome: nomeTratado,
      quantidadeAtual: quantidadeNumerica,
    };
  };

  const cadastrarMaterial = async () => {
    const novoMaterial = validarFormulario();

    if (!novoMaterial) {
      return;
    }

    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novoMaterial),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível cadastrar o material.");
      }

      Alert.alert("Sucesso", "Material cadastrado com sucesso!");
    } catch (erro) {
      console.error("Erro ao cadastrar material:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível cadastrar o material. Tente novamente.",
      );
    }
  };

  useEffect(() => {
    buscarMateriais();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>

      {/* Breve descrição do projeto inserida abaixo */}
      <Text style={styles.description}>
        Este template servirá para desenvolver o projeto responsável por
        modernizar o controle de insumos médicos do almoxarifado. Através desta
        interface conectada à API, é possível realizar o inventário em tempo
        real, cadastrar novos materiais e registrar baixas de estoque de forma
        ágil e segura.
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
        onPress={cadastrarMaterial}
      >
        <Text style={styles.buttonText}>Cadastrar material</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Materiais cadastrados</Text>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={styles.loading}
        />
      ) : (
        <FlatList
          testID="lista-materiais"
          data={materiais}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.materialItem}>
              <Text style={styles.materialName}>{item.nome || item.name}</Text>

              <Text style={styles.materialQuantity}>
                Quantidade: {item.quantidadeAtual}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum material cadastrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10, // Reduzido ligeiramente para aproximar o texto explicativo
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20, // Dá um espaçamento confortável entre as linhas do parágrafo
    marginBottom: 30, // Margem inferior para afastar o texto dos futuros inputs dos alunos
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  materialItem: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  materialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  materialQuantity: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  loading: {
    marginTop: 20,
  },
});
