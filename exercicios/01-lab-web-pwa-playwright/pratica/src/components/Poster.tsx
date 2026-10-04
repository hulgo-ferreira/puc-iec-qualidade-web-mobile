// Poster sem imagem externa: bloco colorido determinístico pela inicial do
// título. Mantém o app 100% offline e os screenshots de visual regression
// estáveis (imagem remota = fonte clássica de diff flaky).

const PALETTE = [
  ['#1d4ed8', '#7c3aed'],
  ['#7c3aed', '#db2777'],
  ['#0f766e', '#2563eb'],
  ['#b45309', '#be123c'],
  ['#9d174d', '#6d28d9'],
  ['#4d7c0f', '#0f766e'],
  ['#2563eb', '#0891b2'],
];

interface Props {
  title: string;
  small?: boolean;
}

export default function Poster({ title, small }: Props) {
  const initial = title.charAt(0).toUpperCase();
  const [from, to] = PALETTE[title.length % PALETTE.length];
  return (
    <div className={small ? 'poster small' : 'poster'} style={{ background: `linear-gradient(145deg, ${from}, ${to})` }} aria-hidden>
      {initial}
    </div>
  );
}
