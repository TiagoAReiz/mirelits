import type {
  IProjectRepository,
  CreateProjectInput,
  UpdateProjectInput,
  UpdatePinsInput,
} from '../core/project.repository.port'

export class ProjectService {
  constructor(private readonly repo: IProjectRepository) {}

  getAllPublished() { return this.repo.findAllPublished() }
  getAll() { return this.repo.findAll() }
  getById(id: string) { return this.repo.findById(id) }
  create(input: CreateProjectInput) { return this.repo.create(input) }
  update(id: string, input: UpdateProjectInput) { return this.repo.update(id, input) }
  delete(id: string) { return this.repo.delete(id) }
  updatePins(updates: UpdatePinsInput) { return this.repo.updatePins(updates) }
}
