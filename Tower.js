class Tower {
  constructor(x, y, range, damage, cost, type) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.damage = damage;
    this.cost = cost;
    this.type = type;
    this.width = 50;
    this.height = 50;
    this.lastShotTime = 0;
    this.upgraded = false;
    this.shootingCooldown = 3000; // Cooldown base de 3 segundos
  }

  // Verifica se o inimigo está dentro do alcance da torre
  inRange(enemy) {
    return Math.hypot(enemy.x - this.x, enemy.y - this.y) < this.range;
  }

  // Ataca um inimigo se ele estiver dentro do alcance
  attack(enemies, projectiles) {
    const currentTime = Date.now();
    // Condição para disparar, considerando o cooldown
    if (currentTime - this.lastShotTime > this.shootingCooldown) {
      this.lastShotTime = currentTime;

      // Encontrar o inimigo mais próximo dentro do alcance
      const enemy = enemies.find(e => this.inRange(e));
      if (enemy) {
        projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, enemy, 4, this.damage));
      }
    }
  }

  // Atualiza a cor da torre para amarela (inicial) ou laranja (quando upgradada)
  draw(ctx) {
    // Se a torre foi upgradada, usa a cor laranja, caso contrário, usa a cor amarela
    ctx.fillStyle = this.upgraded ? 'orange' : 'yellow'; 
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // Realiza o upgrade da torre, melhorando o dano e descontando recursos
  upgrade(resources) {
    if (resources >= 50 && !this.upgraded) {
      this.damage += 50;  // Aumenta o dano da torre
      this.shootingCooldown -= 500; // Diminui o tempo de cooldown
      this.upgraded = true; // Marca como atualizada
      resources -= 50;   // Subtrai os recursos
    }
    return resources;  // Retorna os recursos após o upgrade
  }
}
