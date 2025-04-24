class Enemy {
  constructor(x, y, speed, health, type, path) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.health = health;
    this.type = type;
    this.currentPathIndex = 0;
    this.path = path; // Caminho do inimigo, fornecido no momento da criação
    
    // Definir o tamanho e a pontuação do inimigo com base no tipo
    this.setSizeAndScore();
  }

  // Ajusta o tamanho e a pontuação de acordo com o tipo do inimigo
  setSizeAndScore() {
    if (this.type === 'fast') {
      this.width = 20;
      this.height = 20;
      this.score = 10;
    } else if (this.type === 'tank') {
      this.width = 50;
      this.height = 50;
      this.score = 50;
    } else {
      this.width = 30;
      this.height = 30;
      this.score = 30;
    }
  }

  move() {
    if (this.currentPathIndex < this.path.length - 1) {
      const target = this.path[this.currentPathIndex + 1];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const moveX = (dx / distance) * this.speed;
        const moveY = (dy / distance) * this.speed;

        // Atualiza a posição do inimigo
        this.x += moveX;
        this.y += moveY;

        // Verifica se o inimigo alcançou o próximo ponto do caminho
        const reachedTarget = Math.abs(this.x - target.x) < this.speed && Math.abs(this.y - target.y) < this.speed;
        if (reachedTarget) {
          this.x = target.x;
          this.y = target.y;
          this.currentPathIndex++;
        }
      }
    }
  }

  draw(ctx) {
    // Define a cor com base no tipo do inimigo
    ctx.fillStyle = this.type === 'fast' ? 'green' : this.type === 'tank' ? 'blue' : 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
