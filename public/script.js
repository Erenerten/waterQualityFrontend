// Mobile Menu Toggle
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
    // Toggle Navigation
    nav.classList.toggle('active');
    
    // Animate Links
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });
    
    // Burger Animation
    burger.classList.toggle('toggle');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form Submission
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Form verilerini al
    const formData = {
        isim: contactForm.querySelector('input[placeholder="Adınız Soyadınız"]').value,
        email: contactForm.querySelector('input[placeholder="Kurumsal E-posta"]').value,
        telefon: contactForm.querySelector('input[placeholder="Telefon Numarası"]').value,
        kurum: contactForm.querySelector('input[placeholder="Kurum/Firma Adı"]').value,
        sektor: contactForm.querySelector('select').value,
        mesaj: contactForm.querySelector('textarea').value,
        tarih: new Date().toLocaleString('tr-TR')
    };

    // Mevcut talepleri al
    let talepler = JSON.parse(localStorage.getItem('demoTalepleri')) || [];
    
    // Yeni talebi ekle
    talepler.push(formData);
    
    // LocalStorage'a kaydet
    localStorage.setItem('demoTalepleri', JSON.stringify(talepler));

    // Kullanıcıya bilgi ver
    alert('Demo talebiniz başarıyla kaydedildi!');
    
    // Formu temizle
    contactForm.reset();
});

// Admin paneli için talepleri görüntüleme fonksiyonu
function talepleriGoster() {
    const talepler = JSON.parse(localStorage.getItem('demoTalepleri')) || [];
    console.table(talepler); // Geliştirici konsolunda talepleri tablo olarak göster
    return talepler;
}

// Scroll Animation
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Navbar Background Change on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Sensör verileri için grafik oluşturma
const createChart = (canvasId, label, color) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
                duration: 0
            }
        }
    });
};

// Grafikleri oluştur
const temperatureChart = createChart('temperatureChart', 'Sıcaklık (°C)', '#FF6B6B');
const tdsChart = createChart('tdsChart', 'TDS (ppm)', '#4ECDC4');
const turbidityChart = createChart('turbidityChart', 'Bulanıklık (NTU)', '#45B7D1');
const conductivityChart = createChart('conductivityChart', 'İletkenlik (µS/cm)', '#96CEB4');

// Sensör verilerini güncelleme fonksiyonu
function updateSensorData() {
    // Simüle edilmiş sensör verileri (gerçek verilerle değiştirilecek)
    const now = new Date();
    const time = now.toLocaleTimeString();
    
    // Rastgele değerler üret (gerçek sensör verileriyle değiştirilecek)
    const temperature = (20 + Math.random() * 5).toFixed(1);
    const tds = Math.floor(500 + Math.random() * 200);
    const turbidity = (2 + Math.random() * 3).toFixed(1);
    const conductivity = Math.floor(1000 + Math.random() * 500);

    // Değerleri güncelle
    document.getElementById('temperature').textContent = `${temperature}°C`;
    document.getElementById('tds').textContent = `${tds} ppm`;
    document.getElementById('turbidity').textContent = `${turbidity} NTU`;
    document.getElementById('conductivity').textContent = `${conductivity} µS/cm`;
    document.getElementById('lastUpdate').textContent = time;
    document.getElementById('location').textContent = 'Marmara Denizi';

    // Grafikleri güncelle
    updateChart(temperatureChart, temperature);
    updateChart(tdsChart, tds);
    updateChart(turbidityChart, turbidity);
    updateChart(conductivityChart, conductivity);
}

// Grafik güncelleme fonksiyonu
function updateChart(chart, value) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    
    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(value);
    
    // Son 10 veriyi göster
    if (chart.data.labels.length > 10) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    chart.update();
}

// Her 5 saniyede bir verileri güncelle
setInterval(updateSensorData, 5000);

// Sayfa yüklendiğinde ilk verileri göster
updateSensorData();

// Modal ve tıklanma sayacı
document.addEventListener('DOMContentLoaded', function() {
    let clickCount = localStorage.getItem('modalClickCount') ? parseInt(localStorage.getItem('modalClickCount')) : 0;
    const modal = document.getElementById('warningModal');
    const acceptButton = document.getElementById('acceptButton');

    // Modal stillerini JavaScript ile ekle
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '9999';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // Modal içerik stillerini ekle
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.backgroundColor = '#ffffff';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

    // Buton stillerini ekle
    const button = modalContent.querySelector('button');
    button.style.backgroundColor = '#0066cc';
    button.style.color = '#ffffff';
    button.style.padding = '10px 20px';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '1rem';

    // Tamam butonuna tıklandığında
    acceptButton.addEventListener('click', function() {
        modal.style.display = 'none';
        clickCount++;
        localStorage.setItem('modalClickCount', clickCount);
        console.log('Modal tıklanma sayısı:', clickCount);
    });
});

// Kalite Raporu Modalı
const reportModal = document.getElementById('reportModal');
const reportForm = document.getElementById('reportForm');
const ctaButton = document.querySelector('.cta-button');

// Kalite Raporu butonuna tıklama olayı
ctaButton.addEventListener('click', () => {
    reportModal.style.display = 'block';
});

// Modalı kapatma fonksiyonu
function closeReportModal() {
    reportModal.style.display = 'none';
}

// Modal dışına tıklandığında kapatma
window.addEventListener('click', (e) => {
    if (e.target === reportModal) {
        closeReportModal();
    }
});

// Rapor formu gönderimi
reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Form verilerini al
    const formData = {
        isim: reportForm.querySelector('input[placeholder="Adınız Soyadınız"]').value,
        email: reportForm.querySelector('input[placeholder="E-posta Adresiniz"]').value,
        telefon: reportForm.querySelector('input[placeholder="Telefon Numaranız"]').value,
        kurum: reportForm.querySelector('input[placeholder="Kurum/Firma Adı"]').value,
        raporTuru: reportForm.querySelector('select').value,
        tarih: new Date().toLocaleString('tr-TR')
    };

    // Mevcut talepleri al
    let raporTalepleri = JSON.parse(localStorage.getItem('raporTalepleri')) || [];
    
    // Yeni talebi ekle
    raporTalepleri.push(formData);
    
    // LocalStorage'a kaydet
    localStorage.setItem('raporTalepleri', JSON.stringify(raporTalepleri));

    // Kullanıcıya bilgi ver
    alert('Rapor talebiniz başarıyla kaydedildi! En kısa sürede size dönüş yapılacaktır.');
    
    // Formu temizle ve modalı kapat
    reportForm.reset();
    closeReportModal();
});

// Admin paneli için rapor taleplerini görüntüleme fonksiyonu
function raporTalepleriniGoster() {
    const raporTalepleri = JSON.parse(localStorage.getItem('raporTalepleri')) || [];
    const tbody = document.getElementById('reportRequestsBody');
    tbody.innerHTML = '';
    
    if (raporTalepleri.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Kayıtlı rapor talebi bulunamadı</td></tr>';
    } else {
        raporTalepleri.forEach(talep => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${talep.isim || '-'}</td>
                <td>${talep.email || '-'}</td>
                <td>${talep.telefon || '-'}</td>
                <td>${talep.kurum || '-'}</td>
                <td>${talep.raporTuru || '-'}</td>
                <td>${talep.tarih || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

/*****************************************************************
 *  REAL-TIME FEED VIA STOMP
 *****************************************************************/

let stompClient = null;

function connectWebSocket() {
  const socket   = new SockJS('/ws');        // Netlify proxy will forward
  stompClient    = Stomp.over(socket);

  // optional: mute debug logs
  stompClient.debug = () => {};

  stompClient.connect({}, () => {
    console.log('✔ connected to /topic/sensor');
    stompClient.subscribe('/topic/sensor', message => {
      const data = JSON.parse(message.body);
      applySensorUpdate(data);
    });
  }, err => {
    console.error('WebSocket error', err);
    // simple retry logic
    setTimeout(connectWebSocket, 5000);
  });
}
