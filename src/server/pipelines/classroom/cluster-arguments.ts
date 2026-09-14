import "server-only";
import { agnes } from "ml-hclust";

const distance = (a: number[], b: number[]) => Math.sqrt(a.reduce((sum, x, i) => sum + (x - b[i]) ** 2, 0));

export function clusterArguments(vectors: number[][]) {
  if (vectors.length < 8 || vectors.length > 50) throw new Error("Classroom requires 8–50 arguments");
  const tree = agnes(vectors, { method: "ward" });
  const scores: { k: number; silhouette: number; groups: number[][] }[] = [];
  for (let k = 2; k <= Math.min(5, vectors.length - 1); k += 1) {
    const groups = tree.group(k).children.map((child) => child.indices().sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]);
    const values = groups.flatMap((group) => group.map((index) => {
      if (group.length === 1) return 0;
      const a = group.filter((j) => j !== index).reduce((sum, j) => sum + distance(vectors[index], vectors[j]), 0) / (group.length - 1);
      const b = Math.min(...groups.filter((other) => other !== group).map((other) => other.reduce((sum, j) => sum + distance(vectors[index], vectors[j]), 0) / other.length));
      return Math.max(a, b) === 0 ? 0 : (b - a) / Math.max(a, b);
    }));
    scores.push({ k, silhouette: values.reduce((sum, value) => sum + value, 0) / values.length, groups });
  }
  const selected = [...scores].sort((a, b) => b.silhouette - a.silhouette || a.k - b.k)[0];
  return { selected, scores };
}
