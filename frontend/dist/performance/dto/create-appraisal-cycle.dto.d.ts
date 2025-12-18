import { AppraisalTemplateType } from '../enums/performance.enums';
import { CycleTemplateAssignmentDto } from './cycle-template-assignment.dto';
import { CycleAssignmentDto } from './cycle-assignment.dto';
export declare class CreateAppraisalCycleDto {
    name: string;
    description?: string;
    cycleType: AppraisalTemplateType;
    startDate: string;
    endDate: string;
    managerDueDate?: string;
    employeeAcknowledgementDueDate?: string;
    templateAssignments: CycleTemplateAssignmentDto[];
    assignments: CycleAssignmentDto[];
}
