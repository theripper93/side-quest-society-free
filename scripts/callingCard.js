import {Socket} from "./lib/socket.js";
import { MODULE_ID } from "./main.js";

export class CallingCard{
    constructor (text, options = {large: true, render: true}) {
        this.text = text;
        this.options = options;
        this.element = document.createElement('div');
        this.element.classList.add('sqs-calling-card-container');
        this.card = document.createElement('div');
        this.card.classList.add('sqs-calling-card');
        this.showPlayers = document.createElement('div');
        this.showPlayers.classList.add('sqs-calling-card-players');
        this.closeButton = document.createElement('div');
        this.closeButton.classList.add('sqs-calling-card-close');
        this.closeButton.innerHTML = `<i class="fas fa-times"></i>`;
        if (this.options.large) this.card.classList.add("large");
        if(game.user.isGM) this.element.appendChild(this.showPlayers);
        this.element.appendChild(this.card);
        this.element.appendChild(this.closeButton);
        if(options.render) this.render();
    }

    async render() {
        document.body.appendChild(this.element);
        this.element.animate([
            {opacity: 0},
            {opacity: 1}
        ], {
            duration: 300,
            easing: "ease-in-out"
        });
        await this.getCardHtml();
        this.showPlayers.innerHTML = `<i class="fas fa-eye"></i>`;
        this.activate3DCard();
        this.element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.close();
        });
        this.closeButton.addEventListener("click", () => {
            this.close();
        });
        this.showPlayers.addEventListener("click", () => {
            Socket.showCallingCard({message: this.text, options: this.options}, {users: game.users.filter(u => u.active && !u.isSelf).map(u => u.id)});
        });
    }

    async getCardHtml() {
        const logo = `modules/${MODULE_ID}/assets/sqs-card-logo.webp`;
        const html = `
        <img src="${logo}" alt="Side Quest Society Logo" class="sqs-card-front">
        <div class="sqs-card-back hidden" background-image="url('${logo}')">
            ${this.text}
        </div>
        `
        this.card.innerHTML = html;
    }

    activate3DCard() {
        this.card.addEventListener("mousemove", (e) => {
            if(this.flipping) return;
            const { width, height, left, top } = this.card.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            const rotateX = ((y - centerY) / centerY) * 15;
            const rotateY = ((centerX - x) / centerX) * 15;
            
            this.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    
        this.card.addEventListener("mouseleave", () => {
            if(this.flipping) return;

            this.card.style.transition = "transform 0.3s ease-out";
            this.card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
        });
        
        this.card.addEventListener("mouseenter", () => {
            if(this.flipping) return;

            this.card.style.transition = "none";
        });
        this.card.addEventListener("click", () => this.flipCard());
    }

    flipCard() {
        this.card.style.transition = "transform 0.3s ease";
        this.card.style.transform = "perspective(1000px) rotateY(90deg)";
        this.flipping = true;
        
        setTimeout(() => {
            const children = this.card.children;
            if (children.length >= 2) {
                children[0].classList.toggle("hidden");
                children[1].classList.toggle("hidden");
            }
            this.card.style.transform = "perspective(1000px) rotateY(0deg)";
            this.flipping = false;
        }, 300);
    }

    close() {
        this.element.animate([
            {opacity: 1},
            {opacity: 0}
        ], {
            duration: 300,
            easing: "ease-in-out"
        }).onfinish = () => {
            this.element.remove();
        }
    }
}