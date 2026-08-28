export abstract class Mapper<DomainEntity, InfrastrutureEntity> {
  abstract domainToInfrastructure(entity: DomainEntity): InfrastrutureEntity;
  abstract infrastructureToDomain(entity: InfrastrutureEntity): DomainEntity;
}
