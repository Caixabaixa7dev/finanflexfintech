# Guia de Estilo - Empréstimo Financeiro

## Visão Geral
Identidade visual sofisticada com elementos inesperados para transmitir segurança e distinção, evitando o template genérico "hero + 3 cols + testimonials + cta".

## Paleta de Cores
- **Primária (Noite)**: #0A1A2F - Azul-marinho profundo (fundo principal, textos primários)
- **Secundária (Marfim Quente)**: #E8E4D9 - Cinza com fundo bege (textos secundários, áreas de descanso)
- **Destaque (Esmeralda)**: #2ECC71 - Verde-esmeralda vibrante (pontos de fluxo positivo, interações)
- **Neutra Clara**: #F5F5F5 - Off-white (fondos de seções, textos inveros)
- **Neutra Escura**: #1A2B4C - Variação da primária para gradientes

## Tipografia
- **Fonte Principal**: Space Grotesk (Google Fonts)
- **Títulos**: 
  * Peso: 800 (ExtraBold)
  * Tamanho: clamp(2.5rem, 5vw, 4.5rem)
  * Letter-spacing: -0.02em
- **Corpo**:
  * Peso: 400 (Regular)
  * Tamanho: clamp(1rem, 1.5vw, 1.25rem)
  * Line-height: 1.6
  * Letter-spacing: 0.01em
- **Destaques/Números**: Peso 600 (SemiBold) quando necessário

## Texturas e Efeitos
- **Textura de Papel Reciclado**: Sobreposição sutil em seções de benefícios (opacity: 0.03)
- **Gradiente Diagonal**: De #0A1A2F para #1A2B4C em 45° (usado em áreas de destaque)
- **Sombra Suave**: 0px 4px 12px rgba(0,0,0,0.05) para elementos elevados

## Ilustrações Customizadas
### Princípios
- "Financeiro visto através de lentes orgânicas"
- Evitar ícones literais (cofres, gráficos de barras retos)
- Linha única com variação de pressão orgânica
- Pontos de conexão (nós) como junctions financeiros
- Espaçamento intencional entre elementos

### Especificações Técnicas
- **Linha Base**: 1.5px de largura, variando de 0.5px a 2px para expressão
- **Cor Primária**: #0A1A2F (70% das ilustrações)
- **Cor de Destaque**: #2ECC71 (15% opacity para pontos de conexão, 100% para fluxos ativos)
- **Espaçamento Mínimo**: 8px entre elementos ilustrativos
- **Formato Preferido**: SVG otimizado para web

### Biblioteca de Motivos
1. **Fluxo Orgânico**: Linhas que se bifurcam suavemente (representando opções de pagamento)
2. **Nós de Conexão**: Pontos onde linhas se encontram (junctions de contrato, pagamento)
3. **Camadas Translúcidas**: Sobreposições de linhas com opacidade variada (profundidade)
4. **Pontilhado Estratégico**: Pequenos pontos em #2ECC71 a 15% opacity (marcos de progresso)

### Regras de Aplicação
- **Ícones de Benefício**: 
  * Proteção: Mão aberta estilizada com linhas convergindo
  * Crescimento: Broto com nós nas extremidades
  * Agilidade: Linha de movimento com pontos de conexão sequenciais
- **Ilustrações de Seção**: 
  * Mudam de conformidade conforme o tema (ex: taxas baixas = linhas convergindo suavemente)
  * Nunca ocupam mais de 40% da largura da seção
  * Sempre têm espaço negativo intencional ao redor

## Componentes de Interface
### Botões
- **Primário**: 
  * Fundo: #0A1A2F
  * Texto: #E8E4D9
  * Borda: 2px solid #2ECC71
  * Hover: Fundo fica #1A2B4C, borda anima para completar um círculo ilustrativo
- **Secundário**:
  * Fundo: Transparente
  * Texto: #0A1A2F
  * Borda: 1.5px solid #0A1A2F
  * Hover: Fundo #E8E4D9, texto #0A1A2F

### Cards (quando usados)
- Fundo: #F5F5F5 com textura de papel reciclado
- Borda: 1px solid #E8E4D9
- Raio: 8px
- Sombra: 0px 2px 8px rgba(0,0,0,0.03)
- Hover: Sombra aumenta para 0px 4px 16px, leve elevação (translateY(-2px))

## Espaçamento e Layout
- **Base**: 8px (todos os espaçamentos são múltiplos)
- **Seções Majorais**: Padding vertical de 64px (desktop), 48px (mobile)
- **Largura Máxima de Conteúdo**: 1200px
- **Grids**: Evitar grids uniformes; preferir assimétrica com sobreposições marginais (20-40px)
- **Espaço Negativo**: Considerado ativo; mínimo 32px entre blocos de conteúdo distintos

## Estados de Interação
- **Transição Padrão**: 0.3s ease-in-out
- **Hover em Elementos Ilustrativos**: Linha se completa ou ponto pulsa suavemente
- **Focus Visível**: Outline 2px solid #2ECC71 com offset de 2px
- **Carregamento**: Placeholder ilustrativo animado (linhas que se desenham gradualmente)