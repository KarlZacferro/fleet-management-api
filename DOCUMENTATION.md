# Documentação Técnica - Fleet Management API

Este documento descreve a lógica de desenvolvimento, as regras de negócio e a estrutura de dados aplicada no projeto de Gestão de Frota.

## 1. Arquitetura e Lógica do Código

A aplicação foi desenvolvida utilizando o framework **NestJS**, seguindo os princípios de **Clean Architecture** e **SOLID**. A estrutura é modular, onde cada entidade (Brands, Models, Vehicles, Users) possui seu próprio módulo, controlador, serviço e repositório.

### Lógica de Fluxo:
1.  **Controladores (Controllers):** Responsáveis por receber as requisições HTTP, validar os dados de entrada via DTOs e encaminhar para os serviços.
2.  **Serviços (Services):** Contêm a lógica de negócio principal, interagem com os repositórios e gerenciam o cache.
3.  **Entidades (Entities):** Representam as tabelas do banco de dados e seus relacionamentos utilizando TypeORM.
4.  **Segurança:** Implementada via JWT (JSON Web Token). Um Guard de autenticação protege as rotas, garantindo que apenas usuários autenticados acessem os recursos.

## 2. Regras de Negócio

-   **Autenticação:** Todas as operações de escrita e leitura exigem um token JWT válido.
-   **Rastreabilidade:** Todas as entidades possuem os campos `created_at`, `updated_at` e `created_by`. O campo `created_by` é preenchido automaticamente com o ID do usuário extraído do token JWT.
-   **Gestão de Veículos:** Não é possível registrar um veículo sem associá-lo a um modelo existente.
-   **Gestão de Modelos:** Modelos podem ser opcionalmente associados a marcas (`brands`).
-   **Cache:** Para otimizar a performance, a listagem de veículos é armazenada no Redis. O cache é invalidado automaticamente em qualquer operação de criação, atualização ou remoção de veículos (estratégia de *Cache Aside*).

## 3. Estrutura de Dados e Tabelas Adicionais

### Tabela `users`
Esta tabela é fundamental para o sistema de segurança. Ela armazena as credenciais e informações de perfil dos usuários que operam o sistema.
-   **Lógica:** Permite a identificação de quem realizou cada ação no sistema (auditoria simplificada via `created_by`).

### Tabela `brands`
Adicionada como um requisito de domínio para organizar melhor a frota.
-   **Lógica:** Serve como o nível mais alto da hierarquia. Uma marca (ex: Volkswagen) pode ter vários modelos (ex: Gol, Polo), e cada modelo pode ter vários veículos (placas diferentes).

| Tabela | Função | Relacionamento |
| :--- | :--- | :--- |
| `users` | Gestão de acesso e auditoria | Relaciona-se com todas via `created_by` |
| `brands` | Classificação por fabricante | 1:N com `models` |
| `models` | Definição técnica do veículo | N:1 com `brands`, 1:N com `vehicles` |
| `vehicles` | Instância física do veículo (frota) | N:1 com `models` |

## 4. Ambiente de Desenvolvimento (VSCode)

Para trabalhar neste projeto no VSCode, recomenda-se:
1.  **Extensões:** ESLint, Prettier, e NestJS Snippets.
2.  **Depuração:** O arquivo `.vscode/launch.json` está configurado para permitir o debug linha por linha diretamente no editor.
3.  **Variáveis de Ambiente:** O arquivo `.env` deve ser configurado com as credenciais do SQL Server e Redis.
