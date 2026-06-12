function validarRetirada(estoque, quantidade) {
  // A quantidade de retirada deve ser maior que 0 e não pode ultrapassar o estoque atual
  return quantidade > 0 && quantidade <= estoque;
}

module.exports = {
  validarRetirada,
};
