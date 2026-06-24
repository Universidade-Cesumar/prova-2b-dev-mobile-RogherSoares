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

function validarData(dataInformada) {
  const formatoCorreto = /^\d{2}-\d{2}-\d{4}$/.test(dataInformada);

  if (!formatoCorreto) {
    return false;
  }

  const [dia, mes, ano] = dataInformada.split("-").map(Number);

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

function converterDataParaIso(dataInformada) {
  const [dia, mes, ano] = dataInformada.split("-");

  return `${ano}-${mes}-${dia}T12:00:00.000Z`;
}

function formatarDataValidade(dataInformada) {
  if (!dataInformada) {
    return "Não informada";
  }

  const data = new Date(dataInformada);

  if (Number.isNaN(data.getTime())) {
    return String(dataInformada);
  }

  return data.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function formatarEntradaData(texto) {
  const apenasNumeros = texto.replace(/\D/g, "").slice(0, 8);

  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  }

  if (apenasNumeros.length <= 4) {
    return `${apenasNumeros.slice(0, 2)}-${apenasNumeros.slice(2)}`;
  }

  return `${apenasNumeros.slice(0, 2)}-${apenasNumeros.slice(
    2,
    4,
  )}-${apenasNumeros.slice(4)}`;
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
  const [categoria, setCategoria] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [validade, setValidade] = useState("");
  const [observacao, setObservacao] = useState("");

  // --- Funções de Requisição e Efeitos ---
  const exibirAlerta = (titulo, mensagem) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensagem}`);
      return;
    }

    Alert.alert(titulo, mensagem);
  };

  const obterMensagemErro = (erro, acao) => {
    const mensagemTecnica = String(erro?.message || "").toLowerCase();

    const falhaDeRede =
      erro instanceof TypeError ||
      mensagemTecnica.includes("network") ||
      mensagemTecnica.includes("fetch") ||
      mensagemTecnica.includes("conexão");

    if (falhaDeRede) {
      return `Não foi possível conectar ao servidor para ${acao}. Verifique sua internet e tente novamente.`;
    }

    return `Não foi possível ${acao}. Tente novamente.`;
  };

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

      const mensagem = obterMensagemErro(erro, "carregar o inventário");

      setErroConexao(mensagem);

      exibirAlerta("Falha de conexão", mensagem);
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
    const categoriaTratada = categoria.trim();
    const unidadeMedidaTratada = unidadeMedida.trim();
    const localizacaoTratada = localizacao.trim();
    const validadeTratada = validade.trim();
    const observacaoTratada = observacao.trim();

    const quantidadeNumerica = Number(quantidade);

    if (!nomeTratado) {
      exibirAlerta("Atenção", "Informe o nome do material.");

      return null;
    }

    if (!quantidade.trim()) {
      exibirAlerta("Atenção", "Informe a quantidade atual do material.");

      return null;
    }

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica <= 0) {
      exibirAlerta(
        "Atenção",
        "A quantidade atual deve ser um número inteiro maior que zero.",
      );

      return null;
    }

    if (!categoriaTratada) {
      exibirAlerta("Atenção", "Informe a categoria do material.");

      return null;
    }

    if (!unidadeMedidaTratada) {
      exibirAlerta("Atenção", "Informe a unidade de medida.");

      return null;
    }

    if (!localizacaoTratada) {
      exibirAlerta("Atenção", "Informe a localização do material.");

      return null;
    }

    if (validadeTratada && !validarData(validadeTratada)) {
      exibirAlerta(
        "Data inválida",
        "Informe uma data válida no formato DD-MM-AAAA.",
      );

      return null;
    }

    return {
      createdAt: new Date().toISOString(),
      nome: nomeTratado,
      categoria: categoriaTratada,
      unidadeMedida: unidadeMedidaTratada,
      quantidadeAtual: quantidadeNumerica,
      localizacao: localizacaoTratada,
      validade: validadeTratada ? converterDataParaIso(validadeTratada) : "",
      observacao: observacaoTratada,
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
      setCategoria("");
      setUnidadeMedida("");
      setLocalizacao("");
      setValidade("");
      setObservacao("");

      Alert.alert("Sucesso", "Material cadastrado com sucesso!");
    } catch (erro) {
      console.error("Erro ao cadastrar material:", erro);

      const mensagem = obterMensagemErro(erro, "cadastrar o material");

      exibirAlerta("Erro no cadastro", mensagem);
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

      const mensagem = obterMensagemErro(erro, "realizar a baixa no estoque");

      exibirAlerta("Erro na baixa", mensagem);
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

      const mensagem = obterMensagemErro(erro, "excluir o material");

      exibirAlerta("Erro na exclusão", mensagem);
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

  const textoBuscado = normalizarTexto(busca);

  const materiaisFiltrados = materiais.filter((material) => {
    if (!textoBuscado) {
      return true;
    }

    const camposPesquisaveis = [
      material.nome || material.name,
      material.categoria,
      material.unidadeMedida,
      material.localizacao,
      material.observacao,
    ];

    return camposPesquisaveis.some((campo) =>
      normalizarTexto(campo).includes(textoBuscado),
    );
  });

  const cabecalhoLista = (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>🏥</Text>

        <Text style={styles.title}>Almoxarifado - Enfermagem</Text>

        <Text style={styles.description}>
          Controle de materiais do almoxarifado com cadastro, consulta, baixa de
          estoque e alerta para itens críticos.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>➕</Text>
          <View>
            <Text style={styles.formTitle}>Cadastrar material</Text>
            <Text style={styles.formSubtitle}>
              Preencha os dados principais do item
            </Text>
          </View>
        </View>

        <View style={styles.formGrid}>
          <View style={styles.formField}>
            <Text style={styles.label}>📦 Nome do material</Text>

            <TextInput
              testID="input-nome"
              style={styles.input}
              placeholder="Ex.: Luva de procedimento"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={[styles.formField, styles.formFieldSmall]}>
            <Text style={styles.label}>🔢 Quantidade</Text>

            <TextInput
              testID="input-quantidade"
              style={styles.input}
              placeholder="Ex.: 100"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>🏷️ Categoria</Text>

            <TextInput
              testID="input-categoria"
              style={styles.input}
              placeholder="Ex.: Material de consumo"
              value={categoria}
              onChangeText={setCategoria}
              autoCapitalize="sentences"
            />
          </View>

          <View style={[styles.formField, styles.formFieldSmall]}>
            <Text style={styles.label}>📏 Unidade</Text>

            <TextInput
              testID="input-unidade-medida"
              style={styles.input}
              placeholder="Ex.: Caixa"
              value={unidadeMedida}
              onChangeText={setUnidadeMedida}
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>📍 Localização</Text>

            <TextInput
              testID="input-localizacao"
              style={styles.input}
              placeholder="Ex.: Armário A - Prateleira 2"
              value={localizacao}
              onChangeText={setLocalizacao}
              autoCapitalize="sentences"
            />
          </View>

          <View style={[styles.formField, styles.formFieldSmall]}>
            <Text style={styles.label}>📅 Validade</Text>

            <TextInput
              testID="input-validade"
              style={styles.input}
              placeholder="Ex.: 30-12-2027"
              value={validade}
              onChangeText={(texto) => setValidade(formatarEntradaData(texto))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={[styles.formField, styles.formFieldFull]}>
            <Text style={styles.label}>📝 Observação</Text>

            <TextInput
              testID="input-observacao"
              style={[styles.input, styles.observationInput]}
              placeholder="Ex.: Manter em local seco"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
          </View>
        </View>

        <TouchableOpacity
          testID="btn-cadastrar"
          style={[styles.button, cadastrando && styles.buttonDisabled]}
          onPress={cadastrarMaterial}
          disabled={cadastrando}
        >
          {cadastrando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>✅ Cadastrar material</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🔎</Text>
          <View>
            <Text style={styles.sectionTitle}>Materiais cadastrados</Text>
            <Text style={styles.formSubtitle}>
              Consulte os itens disponíveis no estoque
            </Text>
          </View>
        </View>

        <TextInput
          testID="input-busca"
          style={styles.searchInput}
          placeholder="Pesquisar por nome, categoria ou localização..."
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
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        testID="lista-materiais"
        data={carregando ? [] : materiaisFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshing={atualizando}
        onRefresh={() => buscarMateriais(true)}
        ListHeaderComponent={cabecalhoLista}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
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
              <View style={styles.materialHeader}>
                <View style={styles.materialTitleArea}>
                  <Text style={styles.materialIcon}>
                    {estoqueCritico ? "⚠️" : "📦"}
                  </Text>

                  <View style={styles.materialTitleText}>
                    <Text style={styles.materialName}>
                      {item.nome || item.name}
                    </Text>

                    <Text style={styles.materialSubtitle}>
                      {item.categoria || "Categoria não informada"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.stockCard,
                    estoqueCritico && styles.stockCardCritical,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockNumber,
                      estoqueCritico && styles.stockNumberCritical,
                    ]}
                  >
                    {item.quantidadeAtual}
                  </Text>

                  <Text
                    style={[
                      styles.stockLabel,
                      estoqueCritico && styles.stockLabelCritical,
                    ]}
                  >
                    em estoque
                  </Text>
                </View>
              </View>

              {estoqueCritico && (
                <View style={styles.criticalBadge}>
                  <Text style={styles.criticalBadgeText}>
                    ⚠️ Estoque crítico
                  </Text>
                </View>
              )}

              <View style={styles.materialDetails}>
                <Text style={styles.materialDetail}>
                  <Text style={styles.materialDetailLabel}>🏷️ Categoria: </Text>
                  {item.categoria || "Não informada"}
                </Text>

                <Text style={styles.materialDetail}>
                  <Text style={styles.materialDetailLabel}>
                    📏 Unidade de medida:{" "}
                  </Text>
                  {item.unidadeMedida || "Não informada"}
                </Text>

                <Text style={styles.materialDetail}>
                  <Text style={styles.materialDetailLabel}>
                    📍 Localização:{" "}
                  </Text>
                  {item.localizacao || "Não informada"}
                </Text>

                <Text style={styles.materialDetail}>
                  <Text style={styles.materialDetailLabel}>📅 Validade: </Text>
                  {formatarDataValidade(item.validade)}
                </Text>

                {item.observacao?.trim() && (
                  <Text style={styles.materialDetail}>
                    <Text style={styles.materialDetailLabel}>
                      📝 Observação:{" "}
                    </Text>
                    {item.observacao}
                  </Text>
                )}
              </View>

              <Text style={styles.retiradaLabel}>📤 Quantidade para retirar</Text>

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
                  <Text style={styles.baixarButtonText}>⬇️ Dar baixa</Text>
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
                  <Text style={styles.excluirButtonText}>🗑️ Excluir material</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator
              size="large"
              color="#2E7D32"
              style={styles.loading}
            />
          ) : erroConexao ? null : (
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
          )
        }
      />
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#F4F6F8",
},
listContent: {
  paddingTop: 32,
  paddingHorizontal: 16,
  paddingBottom: 40,
  flexGrow: 1,
  width: "100%",
  maxWidth: 1100,
  alignSelf: "center",
},
heroCard: {
  backgroundColor: "#1B5E20",
  borderRadius: 18,
  padding: 24,
  marginBottom: 18,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 4,
},
heroIcon: {
  fontSize: 34,
  marginBottom: 8,
},
title: {
  fontSize: 26,
  fontWeight: "bold",
  textAlign: "center",
  color: "#fff",
  marginBottom: 8,
},
description: {
  fontSize: 15,
  color: "#E8F5E9",
  textAlign: "center",
  lineHeight: 22,
  maxWidth: 760,
},
formCard: {
  backgroundColor: "#fff",
  borderRadius: 18,
  padding: 20,
  marginBottom: 18,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
},
searchCard: {
  backgroundColor: "#fff",
  borderRadius: 18,
  padding: 20,
  marginBottom: 14,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
},
sectionHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
},
sectionIcon: {
  fontSize: 26,
  marginRight: 10,
},
formTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#1F2937",
},
formSubtitle: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 2,
},
formGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
},
formField: {
  flexGrow: 1,
  flexBasis: 260,
},
formFieldSmall: {
  flexBasis: 180,
},
formFieldFull: {
  flexBasis: "100%",
},
label: {
  fontSize: 14,
  fontWeight: "700",
  color: "#374151",
  marginBottom: 6,
},
input: {
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 4,
  backgroundColor: "#F9FAFB",
  fontSize: 15,
},
observationInput: {
  minHeight: 100,
  paddingTop: 12,
},
button: {
  backgroundColor: "#2E7D32",
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 16,
},
buttonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},
sectionTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#1F2937",
},
searchInput: {
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  backgroundColor: "#F9FAFB",
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 12,
  fontSize: 15,
},
totalItems: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#4B5563",
},
materialItem: {
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 18,
  padding: 16,
  marginBottom: 14,
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
},
materialItemCritico: {
  backgroundColor: "#FFF5F5",
  borderColor: "#EF4444",
  borderLeftWidth: 6,
},
materialHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 12,
},
materialTitleArea: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  paddingRight: 12,
},
materialIcon: {
  fontSize: 28,
  marginRight: 10,
},
materialTitleText: {
  flex: 1,
},
materialName: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#111827",
},
materialSubtitle: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 3,
},
stockCard: {
  minWidth: 92,
  borderRadius: 14,
  paddingVertical: 10,
  paddingHorizontal: 12,
  backgroundColor: "#E8F5E9",
  alignItems: "center",
},
stockCardCritical: {
  backgroundColor: "#FEE2E2",
},
stockNumber: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#1B5E20",
},
stockNumberCritical: {
  color: "#B91C1C",
},
stockLabel: {
  fontSize: 11,
  fontWeight: "700",
  color: "#2E7D32",
  marginTop: 2,
},
stockLabelCritical: {
  color: "#B91C1C",
},
criticalBadge: {
  alignSelf: "flex-start",
  backgroundColor: "#FEE2E2",
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginBottom: 10,
},
criticalBadgeText: {
  fontSize: 13,
  fontWeight: "bold",
  color: "#B91C1C",
},
materialDetails: {
  backgroundColor: "#F9FAFB",
  borderRadius: 14,
  padding: 12,
  marginTop: 4,
  borderWidth: 1,
  borderColor: "#EEF2F7",
},
materialDetail: {
  fontSize: 14,
  color: "#4B5563",
  lineHeight: 22,
},
materialDetailLabel: {
  fontWeight: "bold",
  color: "#111827",
},
retiradaLabel: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#374151",
  marginTop: 14,
  marginBottom: 8,
},
retiradaInput: {
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  backgroundColor: "#F9FAFB",
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 15,
},
baixarButton: {
  backgroundColor: "#1565C0",
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  marginTop: 10,
},
baixarButtonText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "bold",
},
excluirButton: {
  backgroundColor: "#C62828",
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  marginTop: 8,
},
excluirButtonText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "bold",
},
buttonDisabled: {
  opacity: 0.6,
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
  borderRadius: 10,
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
errorContainer: {
  backgroundColor: "#FFEBEE",
  borderWidth: 1,
  borderColor: "#C62828",
  borderRadius: 12,
  padding: 12,
  marginTop: 12,
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
  borderRadius: 10,
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
