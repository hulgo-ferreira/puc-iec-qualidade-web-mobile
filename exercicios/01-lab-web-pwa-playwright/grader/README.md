# Grader — Lab Web + PWA (15 pts)

Validator estrutural (parse-only) da rubrica do `../enunciado.md`. A nota
comentada no PR é o **piso automático**; critérios 📝 (CI verde, Lighthouse
rodando) são avaliados manualmente no Canvas.

```bash
npm install
npx ts-node validator.ts --entrega ../            # ou ../_pr/exercicios/02-.../ no CI
```

Smoke local obrigatório antes de distribuir: scaffold → score baixo; specs do
gabarito copiados → score máximo automático.
