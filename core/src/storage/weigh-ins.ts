import type { VitaPactDatabase } from './database';
import type { IsoWeek, WeighIn } from './records';

export async function saveWeighIn(db: VitaPactDatabase, weighIn: WeighIn): Promise<void> {
  await db.weighIns.put(weighIn);
}

export const getWeighIn = (db: VitaPactDatabase, week: IsoWeek): Promise<WeighIn | undefined> =>
  db.weighIns.get(week);

/** Every weigh-in, oldest week first. */
export const listWeighIns = (db: VitaPactDatabase): Promise<WeighIn[]> =>
  db.weighIns.orderBy('week').toArray();
