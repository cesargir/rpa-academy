#!/usr/bin/env python3
"""
RPA Academy - Sistema de Generación de Sitio Web
Ejecuta este script para generar todas las páginas HTML del sitio.
Uso: python build.py
"""

import json
import os
import shutil
from pathlib import Path
from datetime import datetime

# ── Rutas del proyecto ────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
OUTPUT_DIR = BASE_DIR / "dist"

# ── Carga de datos ────────────────────────────────────────────────────────────
def load_json(filename):
    path = DATA_DIR / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def load_template(name):
    path = TEMPLATES_DIR / name
    with open(path, encoding="utf-8") as f:
        return f.read()

# ── Utilidades de formateo ────────────────────────────────────────────────────
def format_price(precio, moneda="CLP"):
    if moneda == "CLP":
        return f"${precio:,.0f} CLP"
    return f"USD {precio:.2f}"

def badge_herramienta(herramienta):
    colores = {
        "UiPath": "badge-uipath",
        "Rocketbot": "badge-rocketbot",
        "UiPath + Rocketbot": "badge-ambos"
    }
    clase = colores.get(herramienta, "badge-default")
    return f'<span class="badge {clase}">{herramienta}</span>'

def badge_nivel(nivel):
    colores = {
        "Principiante": "badge-principiante",
        "Intermedio": "badge-intermedio",
        "Avanzado": "badge-avanzado"
    }
    clase = colores.get(nivel, "badge-default")
    return f'<span class="badge {clase}">{nivel}</span>'

def tags_html(tags):
    return " ".join(f'<span class="tag">#{t}</span>' for t in tags)

def boton_pago_html(item, tipo="manual"):
    """Genera los botones de pago PayPal y MercadoPago"""
    precio = item.get("precio", 0)
    precio_usd = item.get("precio_usd", 0)
    titulo = item.get("titulo", "")
    mp_id = item.get("mercadopago_preference_id", "MP_PREFERENCE_ID")
    pp_btn = item.get("paypal_button_id", "PAYPAL_BTN_ID")

    return f"""
    <div class="botones-pago">
      <a href="https://www.mercadopago.cl/checkout/v1/redirect?pref_id={mp_id}"
         class="btn-pago btn-mp" target="_blank" rel="noopener">
        <img src="/static/img/mp-logo.svg" alt="Mercado Pago" class="pago-logo">
        Pagar con Mercado Pago
        <span class="precio-btn">{format_price(precio)}</span>
      </a>
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
        <input type="hidden" name="cmd" value="_s-xclick">
        <input type="hidden" name="hosted_button_id" value="{pp_btn}">
        <button type="submit" class="btn-pago btn-paypal">
          <img src="/static/img/paypal-logo.svg" alt="PayPal" class="pago-logo">
          Pagar con PayPal
          <span class="precio-btn">USD {precio_usd:.2f}</span>
        </button>
      </form>
    </div>"""

def boton_contacto_html(titulo_item=""):
    config = load_json("config.json")
    wa = config["site"]["whatsapp"]
    msg_base = config["contacto"]["mensaje_whatsapp"]
    msg = f"{msg_base} {titulo_item}"
    wa_url = f"https://wa.me/{wa.replace('+','')}?text={msg.replace(' ', '%20')}"
    email = config["site"]["email_contacto"]
    return f"""
    <div class="grupo-contacto">
      <a href="{wa_url}" class="btn-contacto btn-whatsapp" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Consultar por WhatsApp
      </a>
      <a href="mailto:{email}?subject=Consulta: {titulo_item}" class="btn-contacto btn-email">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Enviar Email
      </a>
    </div>"""

# ── Generadores de tarjetas ───────────────────────────────────────────────────
def card_manual(item):
    precio_display = "GRATIS" if item.get("gratuito") else format_price(item["precio"])
    botones = "" if item.get("gratuito") else boton_pago_html(item, "manual")
    return f"""
    <div class="card card-manual" id="{item['id']}">
      <div class="card-header">
        <div class="card-imagen">
          <img src="/static/img/{item.get('imagen','placeholder.jpg')}" alt="{item['titulo']}" loading="lazy"
               onerror="this.src='/static/img/placeholder-manual.svg'">
          <div class="card-precio-badge">{precio_display}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-badges">
          {badge_herramienta(item['herramienta'])}
          {badge_nivel(item['nivel'])}
        </div>
        <h3 class="card-titulo">{item['titulo']}</h3>
        <p class="card-descripcion">{item['descripcion']}</p>
        <div class="card-tags">{tags_html(item.get('tags',[]))}</div>
      </div>
      <div class="card-footer">
        {botones}
        {boton_contacto_html(item['titulo'])}
      </div>
    </div>"""

def card_video(item):
    precio_display = "GRATIS" if item.get("gratuito") else format_price(item["precio"])
    botones = "" if item.get("gratuito") else boton_pago_html(item, "video")
    return f"""
    <div class="card card-video" id="{item['id']}">
      <div class="card-header">
        <div class="card-imagen video-thumb">
          <img src="/static/img/{item.get('thumbnail','placeholder.jpg')}" alt="{item['titulo']}" loading="lazy"
               onerror="this.src='/static/img/placeholder-video.svg'">
          <div class="play-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div class="card-precio-badge">{precio_display}</div>
          <div class="duracion-badge">⏱ {item.get('duracion','--')}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-badges">
          {badge_herramienta(item['herramienta'])}
          {badge_nivel(item['nivel'])}
        </div>
        <h3 class="card-titulo">{item['titulo']}</h3>
        <p class="card-descripcion">{item['descripcion']}</p>
        <div class="card-tags">{tags_html(item.get('tags',[]))}</div>
      </div>
      <div class="card-footer">
        {botones}
        {boton_contacto_html(item['titulo'])}
      </div>
    </div>"""

def card_capacitacion(item):
    incluye_html = "".join(f"<li>✓ {x}</li>" for x in item.get("incluye", []))
    return f"""
    <div class="card card-capacitacion" id="{item['id']}">
      <div class="card-header-cap">
        <div class="card-badges">
          {badge_herramienta(item['herramienta'])}
          <span class="badge badge-tipo">{item['tipo']}</span>
        </div>
        <h3 class="card-titulo">{item['titulo']}</h3>
        <div class="cap-meta">
          <span>🕐 {item['duracion']}</span>
          <span>💻 {item['modalidad']}</span>
        </div>
      </div>
      <div class="card-body">
        <p class="card-descripcion">{item['descripcion']}</p>
        <ul class="incluye-lista">{incluye_html}</ul>
        <div class="card-tags">{tags_html(item.get('tags',[]))}</div>
      </div>
      <div class="card-footer">
        <div class="precio-capacitacion">
          <span class="precio-label">Inversión</span>
          <span class="precio-valor">{format_price(item['precio'])}</span>
          <span class="precio-usd">/ USD {item['precio_usd']:.0f}</span>
        </div>
        {boton_pago_html(item, 'capacitacion')}
        {boton_contacto_html(item['titulo'])}
      </div>
    </div>"""

# ── Constructor de páginas ────────────────────────────────────────────────────
def build_page(template_name, output_name, context={}):
    """Renderiza un template con contexto simple de reemplazo de variables"""
    config = load_json("config.json")
    base_template = load_template("base.html")
    page_template = load_template(template_name)

    # Inyectar variables globales
    context["SITE_NOMBRE"] = config["site"]["nombre"]
    context["SITE_SUBTITULO"] = config["site"]["subtitulo"]
    context["AUTOR_NOMBRE"] = config["autor"]["nombre"]
    context["AUTOR_TITULO"] = config["autor"]["titulo"]
    context["SITE_EMAIL"] = config["site"]["email_contacto"]
    context["SITE_WHATSAPP"] = config["site"]["whatsapp"]
    context["SITE_LINKEDIN"] = config["site"]["linkedin"]
    context["SITE_YOUTUBE"] = config["site"].get("youtube", "#")
    context["AÑO_ACTUAL"] = str(datetime.now().year)
    context["FORMULARIO_ENDPOINT"] = config["contacto"]["formulario_endpoint"]

    # Renderizar contenido interno
    content = page_template
    for key, value in context.items():
        content = content.replace(f"{{{{{key}}}}}", str(value))

    # Insertar en base
    html = base_template.replace("{{CONTENIDO_PAGINA}}", content)
    for key, value in context.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))

    # Guardar
    output_path = OUTPUT_DIR / output_name
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  ✓ Generado: {output_name}")

# ── Páginas individuales ──────────────────────────────────────────────────────
def build_index():
    manuales = load_json("manuales.json")[:2]
    videos = load_json("videos.json")[:2]
    cards_manuales = "".join(card_manual(m) for m in manuales)
    cards_videos = "".join(card_video(v) for v in videos)
    build_page("index.html", "index.html", {
        "CARDS_MANUALES_DESTACADOS": cards_manuales,
        "CARDS_VIDEOS_DESTACADOS": cards_videos
    })

def build_sobre_mi():
    config = load_json("config.json")
    autor = config["autor"]
    certs_html = "".join(f'<li class="cert-item">🏅 {c}</li>' for c in autor.get("certificaciones", []))
    build_page("sobre-mi.html", "sobre-mi.html", {
        "AUTOR_BIO_LARGA": autor["bio_larga"],
        "AUTOR_FOTO": autor.get("foto", "foto-perfil.jpg"),
        "CERTIFICACIONES": certs_html
    })

def build_servicios():
    manuales = load_json("manuales.json")
    videos = load_json("videos.json")
    caps = load_json("capacitaciones.json")
    cards_m = "".join(card_manual(m) for m in manuales)
    cards_v = "".join(card_video(v) for v in videos)
    cards_c = "".join(card_capacitacion(c) for c in caps)
    build_page("servicios.html", "servicios.html", {
        "CARDS_MANUALES": cards_m,
        "CARDS_VIDEOS": cards_v,
        "CARDS_CAPACITACIONES": cards_c,
        "TOTAL_MANUALES": str(len(manuales)),
        "TOTAL_VIDEOS": str(len(videos)),
        "TOTAL_CAPACITACIONES": str(len(caps))
    })

def build_contacto():
    build_page("contacto.html", "contacto.html", {})

def copy_static():
    dest = OUTPUT_DIR / "static"
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(STATIC_DIR, dest)
    print("  ✓ Archivos estáticos copiados")

# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    print("\n🤖 RPA Academy — Generando sitio web...\n")
    OUTPUT_DIR.mkdir(exist_ok=True)

    build_index()
    build_sobre_mi()
    build_servicios()
    build_contacto()
    copy_static()

    print(f"\n✅ Sitio generado en: {OUTPUT_DIR}/")
    print("   → Sube la carpeta 'dist/' a Vercel o abre dist/index.html para previsualizar\n")

if __name__ == "__main__":
    main()
