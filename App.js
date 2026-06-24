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
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const API_URL = "https://6a18c6de23c3626470ac0536.mockapi.io/api/v1/materiais";

export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  return (
    Number.isFinite(estoque) &&
    Number.isFinite(retirada) &&
    Number.isInteger(estoque) &&
    Number.isInteger(retirada) &&
    estoque >= 0 &&
    retirada > 0 &&
    retirada <= estoque
  );
}

export default function App() {
  // --- Estados da Aplicação ---
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [quantidadesRetirada, setQuantidadesRetirada] = useState({});
  const [baixasEmAndamento, setBaixasEmAndamento] = useState({});
  const [exclusoesEmAndamento, setExclusoesEmAndamento] = useState({});
  const [busca, setBusca] = useState("");
  const [erroConexao, setErroConexao] = useState(null);

  // --- Funções de Requisição e Efeitos ---
  const buscarMateriais = async (atualizacaoManual = false) => {
    try {
      setErroConexao(null);

      if (atualizacaoManual) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }

      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error(
          `Erro ${resposta.status}: não foi possível buscar os materiais.`,
        );
      }

      const dados = await resposta.json();

      setMateriais(dados);
      setErroConexao(null);
    } catch (erro) {
      console.error("Erro ao buscar materiais:", erro);

      setErroConexao(
        "Não foi possível carregar o inventário. Verifique sua conexão com a internet.",
      );

      Alert.alert(
        "Falha de conexão",
        "Não foi possível atualizar os materiais. Verifique sua internet e tente novamente.",
      );
    } finally {
      if (atualizacaoManual) {
        setAtualizando(false);
      } else {
        setCarregando(false);
      }
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
    if (cadastrando) {
      return;
    }

    const novoMaterial = validarFormulario();

    if (!novoMaterial) {
      return;
    }

    try {
      setCadastrando(true);

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

      const materialCadastrado = await resposta.json();

      setMateriais((listaAtual) => [...listaAtual, materialCadastrado]);

      setNome("");
      setQuantidade("");

      Alert.alert("Sucesso", "Material cadastrado com sucesso!");
    } catch (erro) {
      console.error("Erro ao cadastrar material:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível cadastrar o material. Tente novamente.",
      );
    } finally {
      setCadastrando(false);
    }
  };

  const solicitarBaixa = async (material) => {
    const materialId = String(material.id);

    if (baixasEmAndamento[materialId] || exclusoesEmAndamento[materialId]) {
      return;
    }

    const valorInformado = quantidadesRetirada[materialId];

    if (!valorInformado || !valorInformado.trim()) {
      Alert.alert("Atenção", "Informe a quantidade que deseja retirar.");
      return;
    }

    const estoqueAtual = Number(material.quantidadeAtual);
    const quantidadeRetirada = Number(valorInformado);

    if (!Number.isInteger(quantidadeRetirada)) {
      Alert.alert(
        "Retirada inválida",
        "A quantidade retirada deve ser um número inteiro.",
      );
      return;
    }

    if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
      Alert.alert(
        "Retirada inválida",
        `Não é possível retirar ${quantidadeRetirada} unidade(s). O estoque disponível é de ${estoqueAtual} unidade(s).`,
      );
      return;
    }

    const novoEstoque = estoqueAtual - quantidadeRetirada;

    try {
      setBaixasEmAndamento((estadoAtual) => ({
        ...estadoAtual,
        [materialId]: true,
      }));

      const { id, ...dadosMaterial } = material;

      const resposta = await fetch(`${API_URL}/${materialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dadosMaterial,
          quantidadeAtual: novoEstoque,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível realizar a baixa.");
      }

      const materialAtualizado = await resposta.json();

      setMateriais((listaAtual) =>
        listaAtual.map((itemAtual) =>
          String(itemAtual.id) === materialId ? materialAtualizado : itemAtual,
        ),
      );

      setQuantidadesRetirada((valoresAtuais) => {
        const novosValores = { ...valoresAtuais };

        delete novosValores[materialId];

        return novosValores;
      });

      Alert.alert(
        "Baixa realizada",
        `${quantidadeRetirada} unidade(s) retirada(s) com sucesso.`,
      );
    } catch (erro) {
      console.error("Erro ao realizar baixa:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível realizar a baixa no estoque. Tente novamente.",
      );
    } finally {
      setBaixasEmAndamento((estadoAtual) => {
        const novoEstado = { ...estadoAtual };

        delete novoEstado[materialId];

        return novoEstado;
      });
    }
  };

  const excluirMaterial = async (material) => {
    const materialId = String(material.id);

    if (exclusoesEmAndamento[materialId] || baixasEmAndamento[materialId]) {
      return;
    }

    try {
      setExclusoesEmAndamento((estadoAtual) => ({
        ...estadoAtual,
        [materialId]: true,
      }));

      const resposta = await fetch(`${API_URL}/${materialId}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível excluir o material.");
      }

      setMateriais((listaAtual) =>
        listaAtual.filter((itemAtual) => String(itemAtual.id) !== materialId),
      );

      setQuantidadesRetirada((valoresAtuais) => {
        const novosValores = { ...valoresAtuais };

        delete novosValores[materialId];

        return novosValores;
      });

      Alert.alert("Material excluído", "O material foi excluído com sucesso.");
    } catch (erro) {
      console.error("Erro ao excluir material:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível excluir o material. Tente novamente.",
      );
    } finally {
      setExclusoesEmAndamento((estadoAtual) => {
        const novoEstado = { ...estadoAtual };

        delete novoEstado[materialId];

        return novoEstado;
      });
    }
  };

  const confirmarExclusao = (material) => {
    const nomeMaterial = material.nome || material.name || "Material sem nome";

    if (Platform.OS === "web") {
      const confirmouExclusao = window.confirm(
        `Deseja realmente excluir "${nomeMaterial}"?`,
      );

      if (confirmouExclusao) {
        excluirMaterial(material);
      }

      return;
    }

    Alert.alert(
      "Excluir material",
      `Deseja realmente excluir "${nomeMaterial}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirMaterial(material),
        },
      ],
    );
  };

  useEffect(() => {
    buscarMateriais();
  }, []);

  const materiaisFiltrados = materiais.filter((material) => {
    const nomeMaterial = String(
      material.nome || material.name || "",
    ).toLowerCase();

    const textoBuscado = busca.trim().toLowerCase();

    return nomeMaterial.includes(textoBuscado);
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>

      <Text style={styles.description}>
        Controle mobile de materiais do almoxarifado. Consulte o inventário
        atualizado e cadastre novos insumos de forma rápida e segura.
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
        style={[styles.button, cadastrando && styles.buttonDisabled]}
        onPress={cadastrarMaterial}
        disabled={cadastrando}
      >
        {cadastrando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar material</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Materiais cadastrados</Text>

      <TextInput
        testID="input-busca"
        style={styles.searchInput}
        placeholder="Pesquisar material..."
        value={busca}
        onChangeText={setBusca}
      />

      <Text testID="total-itens" style={styles.totalItems}>
        {materiaisFiltrados.length === 1
          ? "1 material encontrado"
          : `${materiaisFiltrados.length} materiais encontrados`}
      </Text>

      {erroConexao && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{erroConexao}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => buscarMateriais()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={styles.loading}
        />
      ) : (
        <FlatList
          testID="lista-materiais"
          data={materiaisFiltrados}
          refreshing={atualizando}
          onRefresh={() => buscarMateriais(true)}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const estoqueCritico = Number(item.quantidadeAtual) < 10;

            return (
              <View
                style={[
                  styles.materialItem,
                  estoqueCritico && styles.materialItemCritico,
                ]}
                accessibilityLabel={
                  estoqueCritico ? "estoque-critico" : undefined
                }
              >
                <Text style={styles.materialName}>
                  {item.nome || item.name}
                </Text>

                <Text style={styles.materialQuantity}>
                  Quantidade disponível: {item.quantidadeAtual}
                </Text>

                {estoqueCritico && (
                  <Text style={styles.criticalText}>Estoque crítico</Text>
                )}

                <Text style={styles.retiradaLabel}>
                  Quantidade para retirar
                </Text>

                <TextInput
                  testID="input-retirada"
                  style={styles.retiradaInput}
                  placeholder="Ex.: 5"
                  keyboardType="numeric"
                  value={quantidadesRetirada[String(item.id)] || ""}
                  onChangeText={(novoValor) =>
                    setQuantidadesRetirada((valoresAtuais) => ({
                      ...valoresAtuais,
                      [String(item.id)]: novoValor,
                    }))
                  }
                />
                <TouchableOpacity
                  testID="btn-baixar"
                  style={[
                    styles.baixarButton,
                    (baixasEmAndamento[String(item.id)] ||
                      exclusoesEmAndamento[String(item.id)]) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() => solicitarBaixa(item)}
                  disabled={Boolean(
                    baixasEmAndamento[String(item.id)] ||
                    exclusoesEmAndamento[String(item.id)],
                  )}
                >
                  {baixasEmAndamento[String(item.id)] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.baixarButtonText}>Dar baixa</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  testID="btn-excluir"
                  style={[
                    styles.excluirButton,
                    (exclusoesEmAndamento[String(item.id)] ||
                      baixasEmAndamento[String(item.id)]) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() => confirmarExclusao(item)}
                  disabled={Boolean(
                    exclusoesEmAndamento[String(item.id)] ||
                    baixasEmAndamento[String(item.id)],
                  )}
                >
                  {exclusoesEmAndamento[String(item.id)] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.excluirButtonText}>
                      Excluir material
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {busca.trim()
                  ? "Nenhum material encontrado para esta pesquisa."
                  : "Nenhum material cadastrado."}
              </Text>

              {busca.trim() && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setBusca("")}
                >
                  <Text style={styles.clearSearchButtonText}>
                    Limpar pesquisa
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
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
  searchInput: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  totalItems: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 12,
  },
  materialItem: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  materialItemCritico: {
    backgroundColor: "#FFEBEE",
    borderColor: "#C62828",
    borderWidth: 2,
  },
  criticalText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#C62828",
    marginTop: 6,
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
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  clearSearchButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1565C0",
  },
  clearSearchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loading: {
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  retiradaLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#444",
    marginTop: 12,
    marginBottom: 6,
  },
  retiradaInput: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  baixarButton: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  baixarButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  excluirButton: {
    backgroundColor: "#C62828",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  excluirButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorContainer: {
  backgroundColor: "#FFEBEE",
  borderWidth: 1,
  borderColor: "#C62828",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  alignItems: "center",
},
errorText: {
  fontSize: 14,
  color: "#B71C1C",
  textAlign: "center",
  lineHeight: 20,
},
retryButton: {
  backgroundColor: "#C62828",
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginTop: 10,
},
retryButtonText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
},
});
