-- AlterTable
ALTER TABLE "EventConfig" ADD COLUMN     "deadlineInvalidationMessage" TEXT NOT NULL DEFAULT 'Si no recibimos su confirmación dentro de la fecha establecida, su invitación quedará invalidada y sus lugares serán reasignados a otras personas.';
