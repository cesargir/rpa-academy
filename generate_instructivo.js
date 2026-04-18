const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, ExternalHyperlink
} = require("docx");
const fs = require("fs");

// ── Helpers ──────────────────────────────────────────────────────────────────
const BLUE = "1e40af";
const ACCENT = "0891b2";
const GRAY = "64748b";
const LIGHT_BLUE_BG = "e0f2fe";
const LIGHT_GRAY_BG = "f1f5f9";
const YELLOW_BG = "fef9c3";
const GREEN_BG = "dcfce7";
const RED_BG = "fee2e2";
const BORDER_COLOR = "cbd5e1";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: "1e3a5f", font: "Arial" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 28, color: "0c4a6e", font: "Arial" })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: ACCENT, font: "Arial" })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "1e293b", ...opts })]
  });
}
function pMixed(...runs) {
  return new Paragraph({
    spacing: { after: 120 },
    children: runs.map(r => {
      if (typeof r === "string") return new TextRun({ text: r, size: 22, font: "Arial", color: "1e293b" });
      return new TextRun({ size: 22, font: "Arial", color: "1e293b", ...r });
    })
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "1e293b" })]
  });
}
function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "1e293b" })]
  });
}
function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { fill: "1e293b", type: ShadingType.CLEAR },
    indent: { left: 360 },
    children: [new TextRun({ text, size: 19, font: "Courier New", color: "7dd3fc" })]
  });
}
function infoBox(text, bg = LIGHT_BLUE_BG, label = "ℹ️  Nota") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({ children: [
        new TableCell({
          borders,
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: bg.replace("#",""), type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          children: [
            new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: "Arial", color: "0c4a6e" })] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, size: 20, font: "Arial", color: "1e293b" })] })
          ]
        })
      ]})
    ]
  });
}
function separator() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0", space: 1 } },
    children: []
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function tableHeader(cells) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text, i) => new TableCell({
      borders,
      shading: { fill: "1e3a5f", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: "ffffff" })] })]
    }))
  });
}
function tableRow(cells, bg = "ffffff") {
  return new TableRow({
    children: cells.map(text => new TableCell({
      borders,
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ spacing:{after:0}, children: [new TextRun({ text, size: 20, font: "Arial", color: "1e293b" })] })]
    }))
  });
}

// ── Document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
        ]
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.LOWER_LETTER, text: "%2.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    children: [

      // ── PORTADA ────────────────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 1200, after: 40 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "⚙️ RPA ACADEMY", size: 52, bold: true, font: "Arial", color: "0c4a6e" })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "INSTRUCTIVO COMPLETO DEL PORTAL WEB", size: 32, bold: true, font: "Arial", color: ACCENT })]
      }),
      new Paragraph({
        spacing: { after: 600 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Guía para publicar, modificar, eliminar contenido y desplegar en Vercel", size: 24, font: "Arial", color: GRAY })]
      }),

      new Table({
        width: { size: 7200, type: WidthType.DXA },
        columnWidths: [7200],
        rows: [new TableRow({ children: [new TableCell({
          borders,
          shading: { fill: "e0f2fe", type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 300, right: 300 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: "Versión 1.0  |  2024  |  Uso interno", size: 20, font: "Arial", color: GRAY, italics: true })
            ]})
          ]
        })]})],
      }),

      pageBreak(),

      // ── ÍNDICE ─────────────────────────────────────────────────────────────
      h1("Tabla de Contenido"),
      p("1. Estructura del Proyecto"),
      p("2. Configuración inicial (config.json)"),
      p("3. Publicar un nuevo Manual / Instructivo PDF"),
      p("4. Publicar una nueva Clase Grabada (Video)"),
      p("5. Publicar una nueva Capacitación"),
      p("6. Modificar contenido existente"),
      p("7. Eliminar contenido publicado"),
      p("8. Cómo ejecutar el sistema localmente"),
      p("9. Integración de pagos: PayPal"),
      p("10. Integración de pagos: Mercado Pago"),
      p("11. Formulario de contacto con Formspree"),
      p("12. Publicar en Vercel (despliegue continuo)"),
      p("13. Actualizar el sitio después de un cambio"),
      p("14. Preguntas frecuentes y solución de problemas"),

      pageBreak(),

      // ── 1. ESTRUCTURA ──────────────────────────────────────────────────────
      h1("1. Estructura del Proyecto"),
      p("El portal está organizado de la siguiente manera. Cada carpeta tiene una función específica:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3600, 5760],
        rows: [
          tableHeader(["Carpeta / Archivo", "Para qué sirve"]),
          tableRow(["data/config.json", "Configuración global: tu nombre, email, WhatsApp, redes sociales y claves de pago"]),
          tableRow(["data/manuales.json", "Lista de todos los manuales publicados"], LIGHT_GRAY_BG),
          tableRow(["data/videos.json", "Lista de todas las clases grabadas publicadas"]),
          tableRow(["data/capacitaciones.json", "Lista de todas las capacitaciones publicadas"], LIGHT_GRAY_BG),
          tableRow(["templates/", "Plantillas HTML base de cada página (no editar a menos que sea diseño)"]),
          tableRow(["static/css/", "Estilos visuales del sitio"], LIGHT_GRAY_BG),
          tableRow(["static/js/", "Funcionalidad JavaScript del sitio"]),
          tableRow(["static/img/", "Imágenes: fotos, thumbnails y logos"], LIGHT_GRAY_BG),
          tableRow(["build.py", "Script Python que genera el sitio. Ejecutar siempre después de editar datos"]),
          tableRow(["dist/", "Carpeta generada automáticamente. NO editar manualmente. Se sube a Vercel"], LIGHT_GRAY_BG),
          tableRow(["vercel.json", "Configuración de despliegue en Vercel"]),
        ]
      }),

      new Paragraph({ spacing: { after: 200 }, children: [] }),
      infoBox("La regla de oro: NUNCA edites los archivos dentro de dist/. Todo el trabajo se hace en data/, static/ o templates/. Luego ejecutas build.py y la carpeta dist/ se regenera automáticamente.", LIGHT_BLUE_BG, "⚠️  Regla de oro"),

      pageBreak(),

      // ── 2. CONFIG ─────────────────────────────────────────────────────────
      h1("2. Configuración Inicial (config.json)"),
      p("Antes de publicar cualquier contenido, edita el archivo data/config.json con tu información personal. Este archivo controla los datos que aparecen en todo el sitio."),
      h3("Ubicación del archivo:"),
      code("rpa-portal/data/config.json"),
      h3("Campos que debes personalizar:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          tableHeader(["Campo", "Qué poner ahí"]),
          tableRow(["site.nombre", "El nombre de tu portal. Ej: \"RPA Academy\""]),
          tableRow(["site.subtitulo", "Frase corta que describe tu portal"], LIGHT_GRAY_BG),
          tableRow(["site.email_contacto", "Tu correo electrónico de contacto"]),
          tableRow(["site.whatsapp", "Tu número con código de país. Ej: +56912345678"], LIGHT_GRAY_BG),
          tableRow(["site.linkedin", "URL completa de tu perfil de LinkedIn"]),
          tableRow(["site.youtube", "URL de tu canal de YouTube"], LIGHT_GRAY_BG),
          tableRow(["autor.nombre", "Tu nombre completo"]),
          tableRow(["autor.titulo", "Tu cargo o especialidad. Ej: Especialista en RPA"], LIGHT_GRAY_BG),
          tableRow(["autor.bio_larga", "Tu biografía completa para la página 'Sobre mí'"]),
          tableRow(["autor.foto", "Nombre del archivo de tu foto en static/img/. Ej: foto-perfil.jpg"], LIGHT_GRAY_BG),
          tableRow(["pagos.paypal_client_id", "Tu Client ID de PayPal (ver sección 9)"]),
          tableRow(["pagos.mercadopago_public_key", "Tu Public Key de Mercado Pago (ver sección 10)"], LIGHT_GRAY_BG),
          tableRow(["contacto.formulario_endpoint", "URL de Formspree para el formulario de contacto (ver sección 11)"]),
        ]
      }),
      new Paragraph({ spacing: { after: 160 }, children: [] }),
      infoBox("Después de editar config.json, ejecuta python build.py desde la terminal para que los cambios se reflejen en el sitio.", GREEN_BG, "✅  Recuerda"),

      pageBreak(),

      // ── 3. NUEVO MANUAL ────────────────────────────────────────────────────
      h1("3. Publicar un nuevo Manual / Instructivo PDF"),
      p("Para agregar un nuevo manual al catálogo, solo debes hacer 2 cosas: agregar el archivo PDF y registrarlo en el JSON."),
      h2("Paso 1: Subir el archivo PDF"),
      p("Copia tu archivo PDF a la carpeta:"),
      code("rpa-portal/content/manuales/"),
      p("Puedes nombrarlo como quieras, por ejemplo: mi-nuevo-manual.pdf"),
      h2("Paso 2: Subir la imagen de portada"),
      p("Copia la imagen de portada (JPG o PNG, 800x500px recomendado) a:"),
      code("rpa-portal/static/img/"),
      p("Ejemplo: portada-mi-manual.jpg"),
      h2("Paso 3: Registrar en el archivo de datos"),
      p("Abre el archivo data/manuales.json con cualquier editor de texto y agrega un nuevo bloque al final del arreglo (antes del corchete de cierre ]):"),
      new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: "Plantilla para copiar y pegar:", bold: true, size: 22, font: "Arial", color: "0c4a6e" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({ children: [new TableCell({
          borders,
          shading: { fill: "0f172a", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '{', size: 19, font: "Courier New", color: "94a3b8" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "id": "manual-XXX",', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "titulo": "Título del Manual",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "descripcion": "Descripción detallada del manual...",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "herramienta": "UiPath",  // UiPath, Rocketbot, o UiPath + Rocketbot', size: 19, font: "Courier New", color: "fcd34d" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "nivel": "Principiante",  // Principiante, Intermedio o Avanzado', size: 19, font: "Courier New", color: "fcd34d" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "precio": 15000,  // Precio en CLP', size: 19, font: "Courier New", color: "c4b5fd" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "precio_usd": 15.00,  // Precio en USD para PayPal', size: 19, font: "Courier New", color: "c4b5fd" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "gratuito": false,  // true si es gratis, false si tiene precio', size: 19, font: "Courier New", color: "fca5a5" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "archivo": "mi-nuevo-manual.pdf",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "imagen": "portada-mi-manual.jpg",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "fecha": "2024-03-15",  // Fecha en formato YYYY-MM-DD', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "paypal_button_id": "TU_PAYPAL_BUTTON_ID",', size: 19, font: "Courier New", color: "f9a8d4" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "mercadopago_preference_id": "TU_MP_PREFERENCE_ID",', size: 19, font: "Courier New", color: "f9a8d4" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "tags": ["UiPath", "Studio", "Principiante"]', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '}', size: 19, font: "Courier New", color: "94a3b8" })] }),
          ]
        })]})],
      }),

      new Paragraph({ spacing: { after: 160 }, children: [] }),
      infoBox("El campo 'id' debe ser único. Usa el formato manual-001, manual-002, etc. Si ya tienes manual-002, el siguiente debe ser manual-003.", YELLOW_BG, "⚠️  Importante"),

      h2("Paso 4: Ejecutar el build"),
      p("Abre una terminal en la carpeta del proyecto y ejecuta:"),
      code("python build.py"),
      p("Verás el mensaje: ✓ Generado: servicios.html — eso confirma que el manual aparece en el sitio."),

      pageBreak(),

      // ── 4. NUEVO VIDEO ─────────────────────────────────────────────────────
      h1("4. Publicar una nueva Clase Grabada (Video)"),
      p("Las clases grabadas se alojan en plataformas externas (Vimeo o YouTube) y se embeben en el sitio. Solo necesitas registrar la URL del video."),
      h2("Paso 1: Subir el video a Vimeo o YouTube"),
      bullet("Vimeo (recomendado para videos de pago): sube en vimeo.com y copia la URL del video"),
      bullet("YouTube: puedes usar videos no listados para que solo quienes compren puedan verlos"),
      bullet("Copia la URL completa del video, por ejemplo: https://vimeo.com/123456789"),
      h2("Paso 2: Subir el thumbnail"),
      p("Sube la imagen miniatura del video (formato 16:9, 1280x720px recomendado) a:"),
      code("rpa-portal/static/img/"),
      h2("Paso 3: Agregar a videos.json"),
      p("Abre data/videos.json y agrega un nuevo bloque con esta plantilla:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({ children: [new TableCell({
          borders,
          shading: { fill: "0f172a", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '{', size: 19, font: "Courier New", color: "94a3b8" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "id": "video-XXX",', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "titulo": "Título de la Clase",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "descripcion": "Descripción de lo que aprenderán...",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "herramienta": "UiPath",', size: 19, font: "Courier New", color: "fcd34d" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "nivel": "Intermedio",', size: 19, font: "Courier New", color: "fcd34d" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "duracion": "45:30",  // Formato MM:SS', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "precio": 18000,', size: 19, font: "Courier New", color: "c4b5fd" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "precio_usd": 18.00,', size: 19, font: "Courier New", color: "c4b5fd" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "gratuito": false,', size: 19, font: "Courier New", color: "fca5a5" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "video_url": "https://vimeo.com/TU_ID_VIDEO",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "thumbnail": "thumbnail-mi-clase.jpg",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "fecha": "2024-03-20",', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "paypal_button_id": "TU_PAYPAL_BUTTON_ID",', size: 19, font: "Courier New", color: "f9a8d4" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "mercadopago_preference_id": "TU_MP_PREFERENCE_ID",', size: 19, font: "Courier New", color: "f9a8d4" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "tags": ["UiPath", "Tutorial", "Principiante"]', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '}', size: 19, font: "Courier New", color: "94a3b8" })] }),
          ]
        })]})],
      }),
      new Paragraph({ spacing: { after: 160 }, children: [] }),
      h2("Paso 4: Ejecutar el build"),
      code("python build.py"),

      pageBreak(),

      // ── 5. NUEVA CAPACITACIÓN ──────────────────────────────────────────────
      h1("5. Publicar una nueva Capacitación"),
      p("Las capacitaciones tienen un campo especial 'incluye' que muestra la lista de beneficios en la tarjeta."),
      h2("Agregar a capacitaciones.json:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({ children: [new TableCell({
          borders,
          shading: { fill: "0f172a", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '{', size: 19, font: "Courier New", color: "94a3b8" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "id": "cap-XXX",', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "titulo": "Nombre de la Capacitación",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "descripcion": "Descripción detallada...",', size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "herramienta": "UiPath",', size: 19, font: "Courier New", color: "fcd34d" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "tipo": "Asesoría Individual",  // o Curso Grupal', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "duracion": "2 horas",', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "modalidad": "Online (Zoom/Meet)",', size: 19, font: "Courier New", color: "7dd3fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "precio": 80000,', size: 19, font: "Courier New", color: "c4b5fd" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "precio_usd": 80.00,', size: 19, font: "Courier New", color: "c4b5fd" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "disponible": true,', size: 19, font: "Courier New", color: "fca5a5" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "paypal_button_id": "TU_PAYPAL_BUTTON_ID",', size: 19, font: "Courier New", color: "f9a8d4" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "mercadopago_preference_id": "TU_MP_PREFERENCE_ID",', size: 19, font: "Courier New", color: "f9a8d4" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "incluye": [', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '    "Sesión de 2 horas 1 a 1",', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '    "Grabación de la sesión",', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '    "Material de apoyo"', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  ],', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '  "tags": ["UiPath", "Individual", "Asesoría"]', size: 19, font: "Courier New", color: "a5b4fc" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: '}', size: 19, font: "Courier New", color: "94a3b8" })] }),
          ]
        })]})],
      }),
      new Paragraph({ spacing: { after: 160 }, children: [] }),
      h2("Ejecutar el build:"),
      code("python build.py"),

      pageBreak(),

      // ── 6. MODIFICAR ──────────────────────────────────────────────────────
      h1("6. Modificar Contenido Existente"),
      p("Para modificar cualquier dato de un item ya publicado, solo edita el campo correspondiente en el archivo JSON."),
      h2("Ejemplo: cambiar el precio de un manual"),
      numbered("Abre data/manuales.json"),
      numbered("Busca el manual por su 'id' (Ctrl+F en tu editor)"),
      numbered('Cambia el valor del campo "precio". Por ejemplo: de 15000 a 18000'),
      numbered("Guarda el archivo"),
      numbered("Ejecuta: python build.py"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      h2("Ejemplo: actualizar la descripción de una capacitación"),
      numbered("Abre data/capacitaciones.json"),
      numbered("Encuentra el bloque de la capacitación"),
      numbered('Edita el texto del campo "descripcion"'),
      numbered("Guarda y ejecuta python build.py"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      infoBox("Los cambios en los archivos JSON no se publican solos. Siempre debes ejecutar python build.py después de cada modificación para regenerar el sitio.", YELLOW_BG, "⚠️  Importante"),

      pageBreak(),

      // ── 7. ELIMINAR ───────────────────────────────────────────────────────
      h1("7. Eliminar Contenido Publicado"),
      p("Para quitar un item del catálogo, simplemente borra su bloque del archivo JSON correspondiente."),
      h2("Pasos para eliminar un manual:"),
      numbered("Abre data/manuales.json"),
      numbered("Identifica el bloque completo del manual a eliminar (desde { hasta }, incluyendo la coma si no es el último elemento)"),
      numbered("Selecciona y borra ese bloque completo"),
      numbered("Verifica que el JSON siga siendo válido: los bloques restantes deben estar separados por comas, y el último bloque NO debe tener coma al final"),
      numbered("Guarda el archivo"),
      numbered("Ejecuta: python build.py"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      infoBox("Si el item eliminado tenía un archivo PDF o imagen, puedes borrarlos también de las carpetas content/ y static/img/ para mantener el proyecto limpio. Sin embargo, esto es opcional y no afecta el funcionamiento del sitio.", LIGHT_BLUE_BG, "💡  Consejo"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      h2("¿Cómo verificar que el JSON es válido?"),
      p("Puedes pegar el contenido del JSON en jsonlint.com para verificar que no haya errores de sintaxis."),

      pageBreak(),

      // ── 8. LOCAL ──────────────────────────────────────────────────────────
      h1("8. Ejecutar el Sitio Localmente"),
      p("Antes de publicar en Vercel, puedes previsualizar el sitio en tu computador."),
      h2("Requisitos:"),
      bullet("Python 3.8 o superior instalado"),
      bullet("Editor de texto (VS Code recomendado)"),
      h2("Pasos:"),
      numbered("Abre una terminal (CMD, PowerShell o Terminal de VS Code)"),
      numbered("Navega a la carpeta del proyecto:"),
      code("cd ruta/a/rpa-portal"),
      numbered("Ejecuta el build:"),
      code("python build.py"),
      numbered("Abre el servidor local:"),
      code("cd dist && python -m http.server 8000"),
      numbered("Abre tu navegador en: http://localhost:8000"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      infoBox("El servidor local muestra exactamente cómo se verá el sitio en Vercel. Siempre revisa aquí antes de hacer un despliegue.", GREEN_BG, "✅  Buena práctica"),

      pageBreak(),

      // ── 9. PAYPAL ─────────────────────────────────────────────────────────
      h1("9. Integración de Pagos: PayPal"),
      p("Hay dos formas de usar PayPal. Se recomienda usar Hosted Buttons (más simple) para comenzar."),
      h2("Opción A: PayPal Hosted Buttons (Recomendado para comenzar)"),
      numbered("Entra a paypal.com/buttons"),
      numbered("Selecciona 'Buy Now' y configura el producto y precio"),
      numbered("Haz clic en 'Create Button'"),
      numbered("PayPal te dará un 'Hosted Button ID' (una cadena como XXXX123ABCD)"),
      numbered('Copia ese ID y pégalo en el campo "paypal_button_id" del item en el JSON correspondiente'),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      infoBox("Cada producto debe tener su propio Hosted Button ID. Crea un botón diferente en PayPal para cada manual, video o capacitación.", YELLOW_BG, "⚠️  Importante"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      h2("Opción B: PayPal Checkout SDK (Para futuras mejoras)"),
      p("Esta opción permite un checkout más fluido integrado en la página. Requiere agregar tu PayPal Client ID en config.json:"),
      code('"paypal_client_id": "TU_CLIENT_ID_AQUI"'),
      p("Puedes obtener tu Client ID en developer.paypal.com → Apps & Credentials → Create App."),
      h2("Monedas aceptadas:"),
      p("PayPal acepta múltiples monedas. Para Chile, configura los precios en USD en el campo precio_usd de cada item."),

      pageBreak(),

      // ── 10. MERCADO PAGO ──────────────────────────────────────────────────
      h1("10. Integración de Pagos: Mercado Pago"),
      p("Mercado Pago es ideal para clientes en Chile, Argentina, México y otros países de Latinoamérica. Acepta CLP."),
      h2("Pasos para configurar Mercado Pago:"),
      numbered("Crea una cuenta en mercadopago.cl (o el país correspondiente)"),
      numbered("Ve a mercadopago.com/developers → Tus integraciones → Crear aplicación"),
      numbered("Copia tu 'Public Key' de producción y pégala en config.json en el campo mercadopago_public_key"),
      numbered("Para cada producto, debes crear una 'Preference' (preferencia de pago):"),
      numbered("Usa la API de MercadoPago o el panel de desarrolladores para crear una preference con el título y precio del producto"),
      numbered("Obtendrás un 'preference_id'. Pégalo en el campo mercadopago_preference_id del item en el JSON"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      h2("URL de checkout con el preference_id:"),
      p("El botón de Mercado Pago usa esta URL:"),
      code("https://www.mercadopago.cl/checkout/v1/redirect?pref_id=TU_PREFERENCE_ID"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      infoBox("Para crear preferences sin código, puedes usar la herramienta en mercadopago.com/developers/panel o solicitar a tu desarrollador que las cree mediante la API REST de MercadoPago.", LIGHT_BLUE_BG, "💡  Tip"),
      h2("Modo de prueba (Sandbox):"),
      p("Antes de activar pagos reales, usa las credenciales de Sandbox para probar sin cobrar dinero real. Cambia a credenciales de Producción solo cuando todo esté funcionando."),

      pageBreak(),

      // ── 11. FORMSPREE ─────────────────────────────────────────────────────
      h1("11. Formulario de Contacto con Formspree"),
      p("Formspree permite recibir los mensajes del formulario de contacto directamente en tu email, sin necesidad de un servidor backend."),
      h2("Configuración (5 minutos):"),
      numbered("Ve a formspree.io y crea una cuenta gratuita"),
      numbered("Haz clic en '+ New Form'"),
      numbered("Dale un nombre como 'Contacto RPA Academy'"),
      numbered("Formspree te dará una URL con el formato: https://formspree.io/f/XXXXXXXX"),
      numbered("Copia esa URL completa"),
      numbered("Pégala en config.json en el campo: contacto.formulario_endpoint"),
      numbered("Ejecuta python build.py"),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      infoBox("El plan gratuito de Formspree permite recibir hasta 50 mensajes por mes. Si necesitas más, puedes actualizar a un plan de pago o usar alternativas como EmailJS o una función Serverless de Vercel.", GREEN_BG, "✅  Plan gratuito disponible"),

      pageBreak(),

      // ── 12. VERCEL ────────────────────────────────────────────────────────
      h1("12. Publicar en Vercel (Despliegue Continuo)"),
      p("Vercel desplegará automáticamente tu sitio cada vez que empujes cambios a GitHub. Esto es el despliegue continuo."),
      h2("Requisitos previos:"),
      bullet("Cuenta en github.com"),
      bullet("Cuenta en vercel.com (puedes registrarte con tu cuenta de GitHub)"),
      bullet("Git instalado en tu computador"),
      separator(),
      h2("Paso 1: Inicializar repositorio Git"),
      p("Abre la terminal en la carpeta del proyecto y ejecuta:"),
      code("cd rpa-portal"),
      code("git init"),
      code('git add .'),
      code('git commit -m "Primer commit: Portal RPA Academy"'),
      separator(),
      h2("Paso 2: Subir a GitHub"),
      numbered("Ve a github.com → New Repository"),
      numbered("Nómbralo rpa-academy (sin espacios)"),
      numbered("Déjalo en privado o público según prefieras"),
      numbered("No inicialices con README (ya tienes archivos)"),
      numbered("Copia la URL del repositorio (formato: https://github.com/usuario/rpa-academy.git)"),
      numbered("En la terminal, ejecuta:"),
      code("git remote add origin https://github.com/TU_USUARIO/rpa-academy.git"),
      code("git branch -M main"),
      code("git push -u origin main"),
      separator(),
      h2("Paso 3: Conectar con Vercel"),
      numbered("Ve a vercel.com e inicia sesión"),
      numbered("Haz clic en 'Add New Project'"),
      numbered("Selecciona 'Import Git Repository' y elige tu repositorio rpa-academy"),
      numbered("Vercel detectará la configuración automáticamente gracias al archivo vercel.json"),
      numbered("Revisa la configuración:"),
      bullet("Build Command: python build.py", 1),
      bullet("Output Directory: dist", 1),
      numbered("Haz clic en 'Deploy'"),
      numbered("¡Listo! En 1-2 minutos tu sitio estará en vivo en una URL como: https://rpa-academy.vercel.app"),
      separator(),
      h2("Dominio personalizado (opcional):"),
      p("En Vercel → tu proyecto → Settings → Domains, puedes agregar tu propio dominio como rpaacademy.cl. Solo necesitas apuntar el DNS de tu dominio a los servidores de Vercel."),

      pageBreak(),

      // ── 13. ACTUALIZAR ────────────────────────────────────────────────────
      h1("13. Actualizar el Sitio Después de un Cambio"),
      p("Una vez configurado el despliegue continuo, el flujo para publicar cambios es muy simple:"),
      h2("Flujo de trabajo estándar:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [400, 8960],
        rows: [
          tableHeader(["Paso", "Acción"]),
          tableRow(["1", "Edita el archivo JSON correspondiente (manuales.json, videos.json o capacitaciones.json)"]),
          tableRow(["2", "Ejecuta python build.py para generar el HTML actualizado"], LIGHT_GRAY_BG),
          tableRow(["3", "Revisa los cambios en http://localhost:8000 (opcional pero recomendado)"]),
          tableRow(["4", 'Ejecuta: git add .'], LIGHT_GRAY_BG),
          tableRow(["5", 'Ejecuta: git commit -m "Descripción de lo que cambiaste"']),
          tableRow(["6", "Ejecuta: git push origin main"], LIGHT_GRAY_BG),
          tableRow(["7", "Vercel detecta el push automáticamente y despliega en 1-2 minutos"]),
        ]
      }),
      new Paragraph({ spacing: { after: 160 }, children: [] }),
      infoBox("Puedes ver el progreso del despliegue en tiempo real en vercel.com → tu proyecto → Deployments. Si hay un error, Vercel te mostrará exactamente qué falló.", LIGHT_BLUE_BG, "💡  Monitoreo"),

      pageBreak(),

      // ── 14. FAQ ───────────────────────────────────────────────────────────
      h1("14. Preguntas Frecuentes y Solución de Problemas"),

      h2("❓ ¿Cómo agrego más de un ítem en el JSON?"),
      p("Cada ítem en el JSON debe estar separado por una coma. El último ítem NO lleva coma. Ejemplo:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({ children: [new TableCell({
          borders,
          shading: { fill: "0f172a", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 200, right: 200 },
          children: [
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: "[", size: 19, font: "Courier New", color: "94a3b8" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: "  { ...primer item... },  // tiene coma", size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: "  { ...segundo item... },  // tiene coma", size: 19, font: "Courier New", color: "86efac" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: "  { ...tercer item... }   // NO lleva coma (es el último)", size: 19, font: "Courier New", color: "fca5a5" })] }),
            new Paragraph({ spacing:{after:0}, children: [new TextRun({ text: "]", size: 19, font: "Courier New", color: "94a3b8" })] }),
          ]
        })]})],
      }),
      new Paragraph({ spacing: { after: 120 }, children: [] }),

      h2("❓ El build falla con error de JSON"),
      p("Si al ejecutar python build.py aparece un error como 'JSONDecodeError', hay un problema de sintaxis en uno de tus archivos JSON. Solución:"),
      bullet("Abre el archivo JSON que acabas de editar"),
      bullet("Pega su contenido en jsonlint.com"),
      bullet("El validador te mostrará exactamente en qué línea está el error"),

      h2("❓ ¿Cómo hago un item gratuito?"),
      p('Cambia el campo "gratuito" a true. Los botones de pago no aparecerán y la tarjeta mostrará "GRATIS".'),

      h2("❓ Las imágenes no se ven"),
      p("Verifica que el nombre del archivo en el JSON sea exactamente igual al nombre del archivo en static/img/ (incluyendo mayúsculas y extensión). Si la imagen no existe, el sitio mostrará automáticamente un placeholder."),

      h2("❓ ¿Puedo cambiar los colores o el diseño?"),
      p("Sí. Todos los colores están definidos como variables CSS en static/css/main.css al inicio del archivo (sección :root). Cambia los valores de --accent, --bg, --text, etc. para personalizar el tema."),

      h2("❓ El sitio en Vercel no se actualizó"),
      p("Verifica que ejecutaste git push origin main. El despliegue solo ocurre cuando hay un nuevo commit en GitHub. Si el push fue exitoso, espera 1-2 minutos y revisa vercel.com → tu proyecto → Deployments para ver el estado."),

      h2("❓ ¿Puedo tener el sitio en un dominio .cl?"),
      p("Sí. Necesitas: (1) comprar un dominio .cl en un registrador como NIC Chile o GoDaddy, (2) en Vercel, ir a Settings → Domains → Add Domain y pegar tu dominio, (3) seguir las instrucciones de Vercel para configurar los DNS en tu registrador. El proceso toma entre 10 minutos y 48 horas según el registrador."),

      separator(),
      new Paragraph({ spacing: { after: 160 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "— Fin del Instructivo —", size: 20, font: "Arial", color: GRAY, italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [new TextRun({ text: "RPA Academy · Instructivo v1.0 · 2024", size: 18, font: "Arial", color: GRAY })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/claude/rpa-portal/INSTRUCTIVO-RPA-Academy.docx", buffer);
  console.log("✅ Instructivo generado correctamente.");
});
