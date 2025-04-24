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
  
    draw(ctx) {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  