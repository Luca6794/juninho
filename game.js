document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Canvas não encontrado!');
      return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
  
    let resources = 100, lives = 10, waveNumber = 1;
    let enemies = [], towers = [], selectedTower = null, projectiles = [];
    const maxEnemiesPerWave = 5;
  
    const path = [
      { x: 0, y: 300 }, { x: 200, y: 300 },
      { x: 200, y: 150 }, { x: 600, y: 150 },
      { x: 600, y: 450 }, { x: 800, y: 450 }
    ];
  
    // Classe para o inimigo
    class Enemy {
      constructor(x, y, speed, health, type) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.type = type;
        this.currentPathIndex = 0;
        this.setSizeAndScore();
      }
  
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
        if (this.currentPathIndex < path.length - 1) {
          const target = path[this.currentPathIndex + 1];
          const dx = target.x - this.x;
          const dy = target.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
          }
  
          if (Math.abs(this.x - target.x) < this.speed && Math.abs(this.y - target.y) < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.currentPathIndex++;
          }
        }
      }
  
      draw() {
        ctx.fillStyle = this.type === 'fast' ? 'green' : this.type === 'tank' ? 'blue' : 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  
    // Classe para a torre
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
      }
  
      inRange(enemy) {
        return Math.hypot(enemy.x - this.x, enemy.y - this.y) < this.range;
      }
  
      attack() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime > 3000) {
          this.lastShotTime = currentTime;
          const enemy = enemies.find(e => this.inRange(e));
          if (enemy) {
            projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, enemy, 4, this.damage));
          }
        }
      }
  
      draw() {
        // A cor será laranja caso a torre tenha sido upgradada, senão será amarela
        ctx.fillStyle = this.upgraded ? 'orange' : 'yellow'; 
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
  
      upgrade() {
        if (!this.upgraded && resources >= 50) {
          this.damage += 50;
          resources -= 50;
          this.upgraded = true;
        }
      }
    }
  
    // Classe para o projétil
    class Projectile {
      constructor(x, y, target, speed, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = speed;
        this.damage = damage;
        this.radius = 5;
      }
  
      move() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          this.x += (dx / distance) * this.speed;
          this.y += (dy / distance) * this.speed;
        }
      }
  
      hasHitTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius + this.target.width / 2;
      }
  
      draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    // Função para verificar a validade do local para a torre
    function isValidTowerPlacement(x, y) {
      const buffer = 55; // Ajuste o valor do buffer para um valor mais seguro
      // Verifica se o local da torre está muito próximo do caminho
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i], p2 = path[i + 1];
        const dist = Math.abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x) /
                     Math.hypot(p2.y - p1.y, p2.x - p1.x);
        if (dist < buffer) return false;
      }
      // Verifica se a torre colide com outras torres
      for (let tower of towers) {
        if (Math.hypot(tower.x - x, tower.y - y) < buffer) return false;
      }
      return true;
    }
  
    // Função para mostrar o botão de upgrade
    function showUpgradeButton(x, y) {
      const btn = document.getElementById('upgradeBtn');
      btn.style.display = 'block';
      btn.style.left = `${x + 25}px`;
      btn.style.top = `${y - 50}px`;
      btn.onclick = () => {
        if (selectedTower) {
          selectedTower.upgrade();
          updateGameInfo();
          btn.style.display = 'none';
        }
      };
    }
  
    // Adicionando evento de clique no canvas
    canvas.addEventListener('click', e => {
      const x = e.offsetX, y = e.offsetY;
      let clickedOnTower = false;
  
      // Verificar se o clique foi em uma torre
      for (let tower of towers) {
        if (x >= tower.x && x <= tower.x + tower.width && y >= tower.y && y <= tower.y + tower.height) {
          selectedTower = tower;
          showUpgradeButton(tower.x, tower.y);
          clickedOnTower = true;
          break;
        }
      }
  
      // Se não for em uma torre e for uma área válida, colocar torre
      if (!clickedOnTower && isValidTowerPlacement(x, y) && resources >= 20) {
        towers.push(new Tower(x, y, 100, 50, 20, 'shooter'));
        resources -= 20;
        updateGameInfo();
      }
    });
  
    // Função para atualizar as informações do jogo
    function updateGameInfo() {
      document.getElementById('resources').textContent = resources;
      document.getElementById('lives').textContent = lives;
      document.getElementById('wave').textContent = waveNumber;
    }
  
    // Função para desenhar o caminho dos inimigos
    function drawPath() {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
  
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(path[0].x, path[0].y, 10, 0, Math.PI * 2);
      ctx.fill();
  
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(path[path.length - 1].x, path[path.length - 1].y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  
    // Função para atualizar o jogo (move inimigos, projéteis, etc)
    function updateGame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPath();
  
      enemies.forEach(enemy => {
        enemy.move();
        enemy.draw();
        if (enemy.currentPathIndex >= path.length - 1) {
          lives--;
          enemies.splice(enemies.indexOf(enemy), 1);
        }
      });
  
      towers.forEach(tower => {
        tower.attack();
        tower.draw();
      });
  
      projectiles.forEach((p, i) => {
        if (!enemies.includes(p.target)) {
          projectiles.splice(i, 1);
          return;
        }
        p.move();
        p.draw();
  
        if (p.hasHitTarget()) {
          p.target.health -= p.damage;
          projectiles.splice(i, 1);
  
          if (p.target.health <= 0) {
            resources += p.target.score;
            enemies.splice(enemies.indexOf(p.target), 1);
          }
        }
      });
  
      updateGameInfo();
      requestAnimationFrame(updateGame);
    }
  
    // Função para gerar inimigos
    function spawnEnemy() {
      // Aumenta a chance de gerar inimigos tankers com o tempo
      const type = Math.random() < 0.3 ? 'fast' : (Math.random() < 0.5 ? 'tank' : 'normal');
      const speed = type === 'fast' ? 2 : 1;
      const health = type === 'tank' ? 200 : 100;
      enemies.push(new Enemy(path[0].x, path[0].y, speed, health, type));
    }
  
    // Intervalo de geração de inimigos
    setInterval(spawnEnemy, 1000);
  
    // Inicia o loop de atualização do jogo
    updateGame();
  });
  