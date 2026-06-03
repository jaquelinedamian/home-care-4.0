# Home Care+

Home Care+ é uma plataforma web acadêmica voltada ao acompanhamento do cuidado domiciliar de pessoas idosas. O projeto reúne interfaces para organização de rotina, comunicação, monitoramento de saúde, dispositivos inteligentes e gestão administrativa.

## Contexto acadêmico

Este repositório foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC), com foco na prototipação funcional de uma solução digital para apoio ao cuidado remoto, à coordenação familiar e à gestão de serviços de home care.

O objetivo é demonstrar, por meio de páginas navegáveis, como diferentes usuários poderiam interagir com um ecossistema de cuidado conectado, acessível e responsivo.

## Perfis do sistema

- **Idoso:** acompanhamento de agenda, medicamentos, consultas, sinais vitais, sono, vacinas, alertas, mensagens e dispositivos.
- **Familiar:** gestão de pessoas cuidadas, rotina, permissões, alertas, mensagens, serviços e dispositivos vinculados.
- **Profissional:** acompanhamento de atendimentos, solicitações, agenda, histórico, mensagens, notificações e dados de dispositivos dos pacientes.
- **Administrador:** gestão de usuários, profissionais, validações, serviços, solicitações, dispositivos, relatórios, auditoria e configurações.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3
- Bootstrap Icons
- Playwright, usado apenas para geração automatizada da documentação visual do apêndice

## Principais funcionalidades

- Página pública inicial com apresentação do projeto.
- Fluxos de login e cadastro demonstrativos.
- Dashboards por perfil.
- Migalhas de navegação nas páginas internas.
- Busca global por perfil.
- Mensagens e notificações contextualizadas.
- Gestão de agenda, consultas, exames, medicamentos, vacinas e histórico.
- Módulo de dispositivos inteligentes com simulação de dados e alertas.
- Áreas administrativas para usuários, serviços, validação profissional, relatórios e auditoria.
- Documentação visual automatizada em PNG e PDF para apêndices acadêmicos.

## Como executar localmente

Por ser um projeto estático, é possível abrir o arquivo `index.html` diretamente no navegador. Para uma navegação mais próxima do ambiente de publicação, recomenda-se executar um servidor local simples na raiz do projeto.

Exemplo com Node.js:

```bash
npx http-server .
```

Em seguida, acesse o endereço exibido no terminal, normalmente:

```text
http://localhost:8080
```

## GitHub Pages

O projeto foi organizado para funcionar como site estático em GitHub Pages. Os caminhos internos usam resolução compatível com publicação em subdiretórios, preservando a navegação entre páginas e os partials reutilizáveis.

Após publicar, a página inicial esperada é:

```text
index.html
```

## Estrutura básica de pastas

```text
/
├── index.html
├── assets/
├── css/
├── img/
├── js/
├── pages/
│   ├── idoso/
│   ├── familiar/
│   ├── profissional/
│   └── admin/
├── partials/
├── tools/
└── apendice/
```

## Documentação visual

O diretório `apendice/` contém capturas completas das telas e um PDF consolidado para uso acadêmico. Para regenerar as imagens e o PDF, instale as dependências e execute:

```bash
npm install
npm run apendice:screenshots
```

## Observação

Este projeto é um protótipo acadêmico navegável. As informações exibidas são demonstrativas e não representam dados reais de pacientes, familiares, profissionais ou serviços de saúde.
