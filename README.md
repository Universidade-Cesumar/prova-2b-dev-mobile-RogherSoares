# Almoxarifado - Enfermagem

Aplicativo mobile desenvolvido para modernizar o controle dos materiais utilizados no almoxarifado das atividades práticas do curso de Enfermagem.

O sistema permite consultar o inventário, cadastrar novos materiais, registrar baixas no estoque e excluir registros. Os dados são armazenados em uma API simulada criada com a plataforma MockAPI.

## Objetivo

Facilitar o registro e o controle dos materiais disponíveis no almoxarifado, reduzindo a necessidade de anotações em papel e atualizações manuais em planilhas.

O aplicativo busca oferecer uma alternativa simples e acessível para acompanhar o estoque diretamente por dispositivos móveis.

## Funcionalidades implementadas

* Cadastro de materiais com nome e quantidade;
* Validação dos campos do formulário;
* Consulta automática dos materiais ao abrir o aplicativo;
* Exibição dinâmica do inventário em uma lista;
* Atualização manual da lista ao puxá-la para baixo;
* Indicadores visuais durante as requisições;
* Bloqueio de cadastros duplicados;
* Limpeza automática do formulário após o cadastro;
* Baixa rápida de materiais diretamente pela lista;
* Validação da quantidade retirada;
* Bloqueio de retiradas iguais a zero, negativas ou superiores ao estoque;
* Atualização do estoque na MockAPI utilizando requisição `PUT`;
* Atualização imediata da quantidade exibida na interface;
* Exclusão de materiais com confirmação do usuário;
* Exclusão permanente dos registros por meio de requisição `DELETE`;
* Atualização automática da lista depois de uma exclusão;
* Bloqueio de ações duplicadas durante as requisições;
* Testes unitários da função `validarRetirada` com Jest;
* Tratamento básico de erros de comunicação com a API.

## Regras de negócio da retirada

A retirada de um material somente é permitida quando:

* o estoque atual representa um número válido;
* a quantidade retirada representa um número inteiro;
* a quantidade retirada é maior que zero;
* a quantidade retirada é menor ou igual ao estoque disponível;
* a operação não resulta em estoque negativo.

A validação é realizada por uma função pura exportada:

```js
validarRetirada(estoqueAtual, quantidadeRetirada)
```

Exemplos:

```js
validarRetirada(10, 5);  // true
validarRetirada(10, 10); // true
validarRetirada(5, 10);  // false
validarRetirada(10, 0);  // false
validarRetirada(10, -2); // false
```

A função também aceita valores numéricos recebidos como texto:

```js
validarRetirada("10", "4"); // true
```

## Tecnologias utilizadas

* React Native;
* Expo;
* JavaScript;
* MockAPI;
* Fetch API;
* Jest;
* Git;
* GitHub.

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

## Operações da API

### Buscar materiais

```http
GET /materiais
```

Busca todos os materiais cadastrados e preenche o inventário exibido na aplicação.

### Cadastrar um material

```http
POST /materiais
```

Exemplo do corpo enviado:

```json
{
  "nome": "Luva de procedimento",
  "quantidadeAtual": 100
}
```

### Dar baixa no estoque

```http
PUT /materiais/:id
```

Atualiza o material selecionado com a nova quantidade calculada.

Exemplo:

```text
Estoque atual: 100
Quantidade retirada: 20
Novo estoque: 80
```

Exemplo do corpo enviado:

```json
{
  "nome": "Luva de procedimento",
  "quantidadeAtual": 80
}
```

### Excluir um material

```http
DELETE /materiais/:id
```

Remove permanentemente o material selecionado da MockAPI.

Depois da confirmação da API, o registro também é removido da lista exibida no aplicativo.

## Identificadores obrigatórios

### Sprint 1

| Componente          | Identificador               |
| ------------------- | --------------------------- |
| Campo do nome       | `testID="input-nome"`       |
| Campo da quantidade | `testID="input-quantidade"` |
| Botão de cadastro   | `testID="btn-cadastrar"`    |
| Lista de materiais  | `testID="lista-materiais"`  |

### Sprint 2

| Componente                   | Identificador             |
| ---------------------------- | ------------------------- |
| Campo da quantidade retirada | `testID="input-retirada"` |
| Botão de baixa               | `testID="btn-baixar"`     |
| Botão de exclusão            | `testID="btn-excluir"`    |

## Testes unitários

Os testes unitários verificam as regras da função pura `validarRetirada`.

O arquivo de teste está localizado em:

```text
__tests__/validarRetirada.test.js
```

Os testes verificam:

* retirada menor que o estoque;
* retirada de todo o estoque disponível;
* valores numéricos recebidos como texto;
* retirada superior ao estoque;
* quantidade negativa;
* retirada igual a zero;
* quantidade decimal;
* texto que não representa um número;
* retirada quando o estoque está zerado;
* utilização de estoque atual negativo.

Para executar todos os testes:

```bash
npm test
```

Para executar os testes sequencialmente:

```bash
npm test -- --runInBand
```

Para executar somente o teste da retirada:

```bash
npm test -- validarRetirada.test.js
```

## Como executar o projeto

### Pré-requisitos

Antes de iniciar, é necessário instalar:

* Node.js;
* npm;
* aplicativo Expo Go em um dispositivo móvel ou um emulador Android/iOS.

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

Depois, escaneie o QR Code exibido no terminal utilizando o aplicativo Expo Go.

Para iniciar o projeto limpando o cache:

```bash
npx expo start -c
```

## Estrutura principal do projeto

```text
almoxarifado-enfermagem/
├── __tests__/
│   └── validarRetirada.test.js
├── App.js
├── README.md
├── package.json
└── package-lock.json
```

## Próximas etapas planejadas

* Registro detalhado das movimentações;
* Identificação do instrutor solicitante;
* Separação dos materiais por categorias;
* Controle de data de validade;
* Alertas para materiais zerados;
* Alertas de validade próxima;
* Estratégia de funcionamento temporário sem internet;
* Relatórios de entradas e saídas.

## Autor

Projeto acadêmico desenvolvido por Rogher Adriano Soares.
