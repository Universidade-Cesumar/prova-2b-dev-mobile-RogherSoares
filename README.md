# Almoxarifado - Enfermagem

Aplicativo mobile desenvolvido para modernizar o controle de materiais do almoxarifado utilizado nas atividades práticas do curso de Enfermagem.

O sistema permite consultar o inventário em tempo real e cadastrar novos materiais diretamente pelo celular. Os dados são armazenados em uma API simulada criada com a plataforma MockAPI.

## Objetivo

Facilitar o registro dos materiais disponíveis no almoxarifado, reduzindo a necessidade de anotações em papel e atualizações manuais em planilhas.

## Funcionalidades implementadas

* Cadastro de materiais com nome e quantidade;
* Validação dos campos do formulário;
* Consulta automática dos materiais cadastrados ao abrir o aplicativo;
* Exibição dinâmica do inventário em uma lista;
* Atualização manual da lista ao puxá-la para baixo;
* Indicador visual durante o carregamento dos dados;
* Bloqueio temporário do botão para evitar cadastros duplicados;
* Limpeza automática do formulário após um cadastro bem-sucedido;
* Tratamento básico de erros de comunicação com a API.

## Tecnologias utilizadas

* React Native;
* Expo;
* JavaScript;
* MockAPI;
* Fetch API;
* Git e GitHub.

## API utilizada

Endpoint de materiais:

```text
https://6a18c6de23c3626470ac0536.mockapi.io/api/v1/materiais
```

### Estrutura básica de um material

```json
{
  "nome": "Luva de procedimento",
  "quantidadeAtual": 100
}
```

## Identificadores obrigatórios da interface

O projeto utiliza os identificadores solicitados para os componentes principais:

| Componente                | Identificador               |
| ------------------------- | --------------------------- |
| Campo do nome do material | `testID="input-nome"`       |
| Campo da quantidade       | `testID="input-quantidade"` |
| Botão de cadastro         | `testID="btn-cadastrar"`    |
| Lista de materiais        | `testID="lista-materiais"`  |

## Como executar o projeto

### Pré-requisitos

Antes de iniciar, instale:

* Node.js;
* npm;
* aplicativo Expo Go no celular ou um emulador Android/iOS.

### Instalação

Clone o repositório:

```bash
git clone URL_DO_SEU_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd NOME_DA_PASTA
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Depois, escaneie o QR Code exibido no terminal com o aplicativo Expo Go.

## Próximas etapas planejadas

* Registro de entradas e saídas de materiais;
* Separação dos materiais por categorias;
* Controle de data de validade;
* Identificação do instrutor solicitante;
* Alertas para itens zerados ou próximos do vencimento;
* Estratégia de funcionamento temporário sem internet.

## Autor

Projeto acadêmico desenvolvido por Rogher Adriano Soares.
